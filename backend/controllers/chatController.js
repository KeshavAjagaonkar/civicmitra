const Chat = require('../models/Chat');
const Complaint = require('../models/Complaint');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { getSocketIO } = require('../utils/socket');

// Number of messages returned per page.
// Keeps the initial chat load fast regardless of conversation length.
const MESSAGES_PER_PAGE = 50;

// @desc    Get chat for a complaint (paginated)
// @route   GET /api/chats/:complaintId?page=1
// @access  Private
exports.getChat = asyncHandler(async (req, res, next) => {
    const { complaintId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    // First, find the complaint to verify authorization
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
        return next(new ErrorResponse('Complaint not found', 404));
    }

    // Ensure user is authorized to view this chat (citizen, assigned staff, worker, or admin)
    const isCitizen = req.user.id === complaint.citizenId.toString();
    const isStaff = req.user.role === 'staff' && complaint.department && req.user.department &&
        complaint.department.toString() === (req.user.department._id || req.user.department).toString();
    const isWorker = req.user.id === complaint.workerId?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCitizen && !isStaff && !isWorker && !isAdmin) {
        return next(new ErrorResponse('Not authorized to access this chat', 403));
    }

    // Find the chat, or create it if it doesn't exist
    let chat = await Chat.findOne({ complaintId });

    if (!chat) {
        chat = await Chat.create({
            complaintId: complaintId,
            citizenId: complaint.citizenId,
            staffId: complaint.departmentStaffId,
            messages: [{
                sender: null,
                message: 'Welcome! A staff member will be with you shortly. You can add more details here.'
            }]
        });
    }

    const totalMessages = chat.messages.length;
    const totalPages = Math.ceil(totalMessages / MESSAGES_PER_PAGE);

    // Slice from the end: page 1 = last 50, page 2 = 51-100 from end, etc.
    // This way the user always sees the most recent messages first.
    const endIndex = totalMessages - (page - 1) * MESSAGES_PER_PAGE;
    const startIndex = Math.max(0, endIndex - MESSAGES_PER_PAGE);
    const pageMessages = chat.messages.slice(startIndex, endIndex);

    // Manually populate sender info for the sliced messages
    const User = require('../models/User');
    const senderIds = [...new Set(
        pageMessages.map(m => m.sender?.toString()).filter(Boolean)
    )];
    const senders = await User.find({ _id: { $in: senderIds } }).select('name role').lean();
    const senderMap = Object.fromEntries(senders.map(s => [s._id.toString(), s]));

    const populatedMessages = pageMessages.map(m => ({
        _id: m._id,
        message: m.message,
        timestamp: m.timestamp,
        sender: m.sender ? (senderMap[m.sender.toString()] || m.sender) : null,
    }));

    res.status(200).json({
        success: true,
        data: {
            _id: chat._id,
            complaintId: chat.complaintId,
            citizenId: chat.citizenId,
            staffId: chat.staffId,
            messages: populatedMessages,
        },
        pagination: {
            page,
            totalPages,
            totalMessages,
            hasMore: page < totalPages,
        },
    });
});

// @desc    Send a message
// @route   POST /api/chats/:complaintId
// @access  Private
exports.sendMessage = asyncHandler(async (req, res, next) => {
    const { complaintId } = req.params;
    const { message } = req.body;

    // Find the complaint and chat
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
        return next(new ErrorResponse('Complaint not found', 404));
    }

    const chat = await Chat.findOne({ complaintId });
    if (!chat) {
        return next(new ErrorResponse('Chat not found', 404));
    }

    // Ensure user is authorized to send a message
    const isCitizen = req.user.id === complaint.citizenId.toString();
    const isStaff = req.user.role === 'staff' && complaint.department && req.user.department &&
        complaint.department.toString() === (req.user.department._id || req.user.department).toString();
    const isWorker = req.user.id === complaint.workerId?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCitizen && !isStaff && !isWorker && !isAdmin) {
        return next(new ErrorResponse('Not authorized to send messages in this chat', 403));
    }

    // Create the new message
    const newMessage = {
        sender: req.user.id,
        message,
    };

    chat.messages.push(newMessage);
    await chat.save();

    // --- REAL-TIME LOGIC ---
    // Get the Socket.IO instance and broadcast the message to the correct room
    const io = getSocketIO();
    if (io) {
        // Populate sender info before emitting for the frontend
        const populatedMessage = {
            ...newMessage,
            sender: { _id: req.user.id, name: req.user.name, role: req.user.role },
            timestamp: newMessage.timestamp || new Date()
        };
        io.to(complaintId).emit('receive_message', populatedMessage);

    }

    // Populate the entire chat to get sender details, then extract the last message
    await chat.populate('messages.sender', 'name role');
    const responseMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({ success: true, data: responseMessage });
});


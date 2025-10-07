const Chat = require('../models/Chat');
const Complaint = require('../models/Complaint');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { getSocketIO } = require('../utils/socket');

// @desc    Get chat for a complaint
// @route   GET /api/chats/:complaintId
// @access  Private
exports.getChat = asyncHandler(async (req, res, next) => {
    const { complaintId } = req.params;

    // First, find the complaint to verify authorization
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
        return next(new ErrorResponse('Complaint not found', 404));
    }

    // Ensure user is authorized to view this chat (citizen, assigned staff, worker, or admin)
    const isCitizen = req.user.id === complaint.citizenId.toString();
    const isStaff = req.user.role === 'staff' && complaint.department && req.user.department &&
                    complaint.department.toString() === req.user.department._id.toString();
    const isWorker = req.user.id === complaint.workerId?.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCitizen && !isStaff && !isWorker && !isAdmin) {
        return next(new ErrorResponse('Not authorized to access this chat', 403));
    }

    // Find the chat, or create it if it doesn't exist
    let chat = await Chat.findOne({ complaintId }).populate('messages.sender', 'name role');

    if (!chat) {
        console.log(`No chat found for complaint ${complaintId}, creating a new one.`);
        chat = await Chat.create({
            complaintId: complaintId,
            citizenId: complaint.citizenId,
            staffId: complaint.departmentStaffId, // Pre-populate staff if assigned
            messages: [{
                sender: null, // System message
                message: 'Welcome! A staff member will be with you shortly. You can add more details here.'
            }]
        });
        // Repopulate to include the sender details in the response
        chat = await chat.populate('messages.sender', 'name role');
    }

    res.status(200).json({ success: true, data: chat });
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
                    complaint.department.toString() === req.user.department._id.toString();
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
        console.log(`Emitted 'receive_message' to room: ${complaintId}`);
    }

    // Populate the entire chat to get sender details, then extract the last message
    await chat.populate('messages.sender', 'name role');
    const responseMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({ success: true, data: responseMessage });
});


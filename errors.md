ProtectedRoute: Object
hook.js:377 ProtectedRoute: Object
hook.js:608 Error: React.Children.only expected to receive a single React element child.
    at Object.only (chunk-BQYK6RGN.js?v=0b0fb079:577:19)
    at Slot.SlotClone (chunk-QRREFG4Y.js?v=0b0fb079:88:66)
    at Object.react_stack_bottom_frame (react-dom_client.js?v=0b0fb079:17424:20)
    at renderWithHooks (react-dom_client.js?v=0b0fb079:4206:24)
    at updateForwardRef (react-dom_client.js?v=0b0fb079:6461:21)
    at beginWork (react-dom_client.js?v=0b0fb079:7864:20)
    at runWithFiberInDEV (react-dom_client.js?v=0b0fb079:1485:72)
    at performUnitOfWork (react-dom_client.js?v=0b0fb079:10868:98)
    at workLoopSync (react-dom_client.js?v=0b0fb079:10728:43)
    at renderRootSync (react-dom_client.js?v=0b0fb079:10711:13)

The above error occurred in the <Slot.SlotClone> component.

React will try to recreate this component tree from scratch using the error boundary you provided, ErrorBoundary.
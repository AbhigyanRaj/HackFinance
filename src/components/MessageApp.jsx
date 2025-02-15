import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { 
    initializeUserAccount, 
    getChatHistory, 
    storeMessage, 
    applyForLoan, 
    getUserBalance, 
    getTotalLoans, 
    getLoanBalance, 
    getLoanDueDate, 
    repayLoan, 
    getLoanHistory, 
    getTransactionHistory, 
    getCreditScore 
} from "../utils/firebaseFunctions";

const MessageApp = ({ closeMessages }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([{ text: "👋 Hi! Send 'HI' to get started.", sender: "system" }]);
  const [balance, setBalance] = useState(null);
  const [language, setLanguage] = useState("en"); // Default: English
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const hardcodedOTP = "1234";
  const [currentStep, setCurrentStep] = useState("greeting");

  // Load chat history on login
  useEffect(() => {
    if (isLoggedIn && phoneNumber) {
      loadChatHistory();
    }
  }, [isLoggedIn, phoneNumber]);

  const loadChatHistory = async () => {
    if (!phoneNumber) return;
    const history = await getChatHistory(phoneNumber);
    setMessages((prevMessages) => [...prevMessages, ...history]);
    const userBalance = await getUserBalance(phoneNumber);
    setBalance(userBalance);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    const input = inputRef.current.value.trim();
    if (!input) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    await storeMessage(phoneNumber, input, "user");

    let response = "";

    if (currentStep === "greeting") {
      if (input.toLowerCase() === "hi") {
        response = "📲 Please enter your 10-digit phone number to continue.";
        setCurrentStep("phoneNumber");
      } else {
        response = "⚠️ Send 'HI' to get started.";
      }
    } 
    else if (currentStep === "phoneNumber") {
      if (/^\d{10}$/.test(input)) {
        setPhoneNumber(input);
        response = "🔑 Enter OTP (Hint: 1234)";
        setCurrentStep("otpVerification");
      } else {
        response = "⚠️ Invalid phone number. Please enter a 10-digit number.";
      }
    } 
    else if (currentStep === "otpVerification") {
      if (input === hardcodedOTP) {
        setIsLoggedIn(true);
        await initializeUserAccount(phoneNumber);
        const userBalance = await getUserBalance(phoneNumber);
        setBalance(userBalance);
        response = `✅ Login successful! Your balance is ₹${userBalance}. Type BALANCE to check funds or LOAN <amount> <days> to apply.`;
        setCurrentStep("bankingFeatures");
      } else {
        response = "❌ Incorrect OTP. Try again.";
      }
    } 
    else if (currentStep === "bankingFeatures") {
      if (input.toLowerCase() === "balance") {
        const userBalance = await getUserBalance(phoneNumber);
        setBalance(userBalance);
        response = `💰 Your balance is ₹${userBalance}.`;
      } 
      else if (input.toLowerCase().startsWith("loan")) {
        const parts = input.split(" ");
        if (parts.length === 3) {
          const amount = parseInt(parts[1], 10);
          const days = parseInt(parts[2], 10);
          if (!isNaN(amount) && amount > 0 && !isNaN(days) && days > 0) {
            response = await applyForLoan(phoneNumber, amount, days);
          } else {
            response = "⚠️ Invalid loan format. Use: LOAN <amount> <days>";
          }
        } else {
          response = "⚠️ Invalid loan format. Use: LOAN <amount> <days>";
        }
      } 
      else if (input.toLowerCase() === "credit score") {
        response = await getCreditScore(phoneNumber);
      } 
      else if (input.toLowerCase() === "loans taken") {
        response = `📊 Total Loans Taken: ₹${await getTotalLoans(phoneNumber)}`;
      } 
      else if (input.toLowerCase() === "loan balance") {
        response = `💰 Loan Balance: ₹${await getLoanBalance(phoneNumber)}`;
      } 
      else if (input.toLowerCase() === "due date") {
        response = await getLoanDueDate(phoneNumber);
      } 
      else if (input.toLowerCase().startsWith("repay")) {
        const amount = parseInt(input.split(" ")[1], 10);
        response = await repayLoan(phoneNumber, amount);
      } 
      else if (input.toLowerCase() === "loan history") {
        response = await getLoanHistory(phoneNumber);
      } 
      else if (input.toLowerCase() === "transactions") {
        response = await getTransactionHistory(phoneNumber);
      } 
      else {
        response = "📢 Available Commands: BALANCE, LOAN <amount> <days>, CREDIT SCORE, LOANS TAKEN, LOAN BALANCE, DUE DATE, REPAY <amount>, LOAN HISTORY, TRANSACTIONS.";
      }
    }

    setMessages((prev) => [...prev, { text: response, sender: "system" }]);
    await storeMessage(phoneNumber, response, "system");

    inputRef.current.value = "";
  };

  return (
    <div className="absolute inset-0 bg-gray-900 flex flex-col rounded-[30px] shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 p-4 text-white border-b border-gray-700">
        <h2 className="text-lg font-semibold tracking-wide">PocketBank SMS</h2>
        <button onClick={closeMessages} className="text-gray-400 hover:text-white transition-all active:scale-90">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 text-sm rounded-2xl max-w-[75%] shadow-md transition-all ${
              msg.sender === "user"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white self-end ml-auto shadow-lg"
                : "bg-gray-700 text-white shadow-md"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="flex items-center bg-gray-800 p-3 border-t border-gray-700">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 p-3 bg-gray-700 text-white rounded-xl outline-none placeholder-gray-400 transition-all focus:bg-gray-600 focus:ring-2 focus:ring-blue-400"
          placeholder="Type a command (e.g., BALANCE, LOAN 500 10, CREDIT SCORE)"
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          onClick={handleSendMessage}
          className="ml-3 p-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl shadow-lg transition-transform transform hover:scale-110 active:scale-90"
        >
          <FaPaperPlane size={18} />
        </button>
      </div>
    </div>
  );
};

export default MessageApp;

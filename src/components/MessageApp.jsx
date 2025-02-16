import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { 
    initializeUserAccount, 
    storeMessage, 
    getUserBalance, 
    applyForLoan, 
    repayLoan,
    getCreditScore,
    getLoanDetails,
    getTransactionHistory,
    getFeatureList
} from "../utils/firebaseFunctions";
import { sendOTP, verifyOTP } from "../utils/smsCommands";

const MessageApp = ({ closeMessages }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([{ text: "👋 Hi! Send 'HI' to get started.", sender: "system" }]);
  const [balance, setBalance] = useState(null);
  const [currentStep, setCurrentStep] = useState("greeting");
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isLoggedIn && phoneNumber) {
      loadUserData();
    }
  }, [isLoggedIn, phoneNumber]);

  const loadUserData = async () => {
    if (!phoneNumber) return;
    const userBalance = await getUserBalance(phoneNumber);
    setBalance(userBalance);
  };

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
        response = "📲 Enter your Aadhaar registered 10-digit phone number:";
        setCurrentStep("phoneNumber");
      } else {
        response = "⚠️ Send 'HI' to get started.";
      }
    } 
    else if (currentStep === "phoneNumber") {
      if (/^\d{10}$/.test(input)) {
        setPhoneNumber(input);
        response = "🔔 OTP has been sent to your phone. Please enter the OTP to continue.";
        await sendOTP(input);
        setCurrentStep("otpVerification");
      } else {
        response = "⚠️ Invalid phone number. Enter a valid 10-digit number.";
      }
    } 
    else if (currentStep === "otpVerification") {
      const otpResponse = await verifyOTP(phoneNumber, input);
      if (otpResponse.includes("✅")) {
        setIsLoggedIn(true);
        await initializeUserAccount(phoneNumber);
        const userBalance = await getUserBalance(phoneNumber);
        setBalance(userBalance);
        response = `✅ Login successful! Your balance is ₹${userBalance}.\nType **LIST** to see available options.`;
        setCurrentStep("bankingFeatures");
      } else {
        response = otpResponse;
      }
    } 
    else if (currentStep === "bankingFeatures") {
      if (input.toLowerCase() === "list") {
        response = await getFeatureList();
      }
      else if (input.toLowerCase().startsWith("loan")) {
        const amount = parseInt(input.split(" ")[1], 10);
        if (!isNaN(amount) && amount > 0) {
          response = await applyForLoan(phoneNumber, amount);
        } else {
          response = "⚠️ Invalid loan amount. Use: **LOAN <amount>**";
        }
      }
      else if (input.toLowerCase().startsWith("repay")) {
        const amount = parseInt(input.split(" ")[1], 10);
        if (!isNaN(amount) && amount > 0) {
          response = await repayLoan(phoneNumber, amount);
        } else {
          response = "⚠️ Invalid repayment amount. Use: **REPAY <amount>**";
        }
      }
      else if (input.toLowerCase() === "balance") {
        const userBalance = await getUserBalance(phoneNumber);
        setBalance(userBalance);
        response = `💰 Your balance is ₹${userBalance}.`;
      }
      else if (input.toLowerCase() === "score") {
        response = await getCreditScore(phoneNumber);
      }
      else if (input.toLowerCase() === "loan details") {
        response = await getLoanDetails(phoneNumber);
      }
      else if (input.toLowerCase() === "history") {
        response = await getTransactionHistory(phoneNumber);
      } 
      else {
        response = "📢 Invalid command! Type **LIST** to see available commands.";
      }
    }

    setMessages((prev) => [...prev, { text: response, sender: "system" }]);
    await storeMessage(phoneNumber, response, "system");

    inputRef.current.value = "";
  };

  return (
    <div className="absolute inset-0 bg-gray-900 flex flex-col rounded-[30px] shadow-2xl overflow-hidden z-50">
      <div className="flex items-center justify-between bg-gray-800 p-4 text-white border-b border-gray-700">
        <h2 className="text-lg font-semibold tracking-wide">PocketBank SMS</h2>
        <button onClick={closeMessages} className="text-gray-400 hover:text-white transition-all active:scale-90">
          <FaTimes size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-900">
        {messages.map((msg, index) => (
          <div key={index} className={`p-3 text-sm rounded-2xl max-w-[75%] shadow-md transition-all ${msg.sender === "user" ? "bg-blue-500 text-white self-end ml-auto shadow-lg" : "bg-gray-700 text-white shadow-md"}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center bg-gray-800 p-3 border-t border-gray-700">
        <input ref={inputRef} type="text" className="flex-1 p-3 bg-gray-700 text-white rounded-xl outline-none placeholder-gray-400" placeholder="Type LIST or other commands" onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} />
        <button onClick={handleSendMessage} className="ml-3 p-3 bg-blue-500 text-white rounded-xl shadow-lg"><FaPaperPlane size={18} /></button>
      </div>
    </div>
  );
};

export default MessageApp;

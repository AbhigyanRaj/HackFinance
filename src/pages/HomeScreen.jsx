import React from "react";
import { FaSms, FaPhone, FaCamera } from "react-icons/fa";

const HomeScreen = ({ openMessages }) => {
  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center p-6">
      <h1 className="text-white text-2xl font-bold">PocketBank Home</h1>
      
      {/* App Icons (Home Screen) */}
      <div className="w-full max-w-sm mt-6 grid grid-cols-3 gap-4">
        <div onClick={openMessages} className="flex flex-col items-center bg-gray-800 p-4 rounded-lg cursor-pointer">
          <FaSms className="text-blue-400 text-2xl" />
          <p className="text-gray-300 mt-2">Messages</p>
        </div>

        <div className="flex flex-col items-center bg-gray-800 p-4 rounded-lg">
          <FaPhone className="text-green-400 text-2xl" />
          <p className="text-gray-300 mt-2">Phone</p>
        </div>

        <div className="flex flex-col items-center bg-gray-800 p-4 rounded-lg">
          <FaCamera className="text-yellow-400 text-2xl" />
          <p className="text-gray-300 mt-2">Camera</p>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;

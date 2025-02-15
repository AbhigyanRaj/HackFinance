import React, { useState, useEffect } from "react";
import {
  FaCalendar,
  FaChrome,
  FaCalculator,
  FaYoutube,
  FaFacebook,
  FaTwitter,
  FaGlobe,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaAddressBook,
  FaPhone,
  FaCamera,
  FaCogs,
  FaSpotify,
  FaCloud,
  FaLock,
  FaBatteryFull,
  FaWifi,
  FaBluetoothB,
  FaAngleUp,
} from "react-icons/fa";
import MessageApp from "./MessageApp";

const PhoneScreen = () => {
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setDate(
        now.toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div
        className="relative bg-[#0e0e0e] w-[380px] h-[700px] rounded-[40px] shadow-2xl border-[6px] border-gray-800 flex flex-col items-center overflow-hidden"
        style={{
          backgroundImage: `url('/wall.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Lock Screen */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-between items-center text-white text-center">
            {/* Status Bar */}
            <div className="absolute top-4 flex w-full justify-between px-6 text-gray-400">
              <FaLock className="text-lg" />
              <div className="flex gap-2">
                <FaBluetoothB className="text-lg" />
                <FaWifi className="text-lg" />
                <FaBatteryFull className="text-lg" />
              </div>
            </div>

            {/* Time & Date */}
            <div className="mt-16">
              <h1 className="text-7xl font-bold drop-shadow-lg">{time}</h1>
              <p className="text-lg text-gray-300 mt-2">{date}</p>
            </div>

            {/* Swipe to Unlock */}
            <div className="absolute bottom-12 flex flex-col items-center">
              <FaAngleUp className="text-white text-2xl mb-2 animate-bounce" />
              <button
                className="px-6 py-2 bg-white text-black text-sm rounded-full shadow-md hover:bg-gray-300 transition-all font-semibold"
                onClick={() => setIsLocked(false)}
              >
                Swipe Up to Unlock
              </button>
            </div>
          </div>
        )}

        {/* Messaging Screen */}
        {isMessagingOpen && <MessageApp closeMessages={() => setIsMessagingOpen(false)} />}

        {/* Status Bar */}
        <div className="absolute top-4 flex w-full justify-between px-6 text-gray-400">
          <FaLock
            className="text-lg cursor-pointer hover:text-white transition-all"
            onClick={() => setIsLocked(true)}
          />
          <div className="flex gap-2">
            <FaBluetoothB className="text-lg" />
            <FaWifi className="text-lg" />
            <FaBatteryFull className="text-lg" />
          </div>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-4 gap-6 mt-24 text-white">
          <AppIcon Icon={FaCalendar} />
          <AppIcon Icon={FaChrome} />
          <AppIcon Icon={FaCalculator} />
          <AppIcon Icon={FaYoutube} />
          <AppIcon Icon={FaFacebook} />
          <AppIcon Icon={FaTwitter} />
          <AppIcon Icon={FaGlobe} />
          <AppIcon Icon={FaInstagram} />
          <AppIcon Icon={FaWhatsapp} />
          <AppIcon Icon={FaEnvelope} highlight onClick={() => setIsMessagingOpen(true)} />
          <AppIcon Icon={FaAddressBook} />
          <AppIcon Icon={FaPhone} />
          <AppIcon Icon={FaCamera} />
          <AppIcon Icon={FaCogs} />
          <AppIcon Icon={FaSpotify} />
          <AppIcon Icon={FaCloud} />
        </div>
      </div>
    </div>
  );
};

// App Icon Component
const AppIcon = ({ Icon, highlight, onClick }) => (
  <div
    className={`w-12 h-12 flex items-center justify-center rounded-lg ${
      highlight ? "bg-green-400 text-black" : "bg-gray-800 text-white"
    } cursor-pointer hover:scale-110 transition-all`}
    onClick={onClick}
  >
    <Icon size={22} />
  </div>
);

export default PhoneScreen;

import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebaseFunctions";

// Generate Random 4-digit OTP
export const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

// Send OTP (Simulated via Firebase Storage)
export const sendOTP = async (phoneNumber) => {
    try {
        const otp = generateOTP();
        const otpRef = doc(db, "otps", phoneNumber);
        await setDoc(otpRef, { otp, timestamp: Date.now() });

        return `🔔 OTP Sent! Check your notifications. (Your OTP: ${otp})`;
    } catch (error) {
        console.error("Error sending OTP:", error);
        return "❌ Error sending OTP.";
    }
};

// Verify OTP
export const verifyOTP = async (phoneNumber, enteredOTP) => {
    try {
        const otpRef = doc(db, "otps", phoneNumber);
        const otpSnapshot = await getDoc(otpRef);

        if (!otpSnapshot.exists()) {
            return "❌ OTP expired or invalid.";
        }

        const storedOTP = otpSnapshot.data().otp;
        if (parseInt(enteredOTP) === storedOTP) {
            return "✅ OTP Verified! Login successful.";
        } else {
            return "❌ Incorrect OTP. Try again.";
        }
    } catch (error) {
        console.error("Error verifying OTP:", error);
        return "❌ Error verifying OTP.";
    }
};

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    orderBy,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCEBht9JJ...",
    authDomain: "pocketbank-e686e.firebaseapp.com",
    projectId: "pocketbank-e686e",
    storageBucket: "pocketbank-e686e.appspot.com",
    messagingSenderId: "511231714913",
    appId: "1:511231714913:web:cdbb0cbabbe05c6f78ec20",
    measurementId: "G-GK2JGXCQGS",
};

// Initialize Firebase (Prevent re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };

// 🔹 Initialize User Account
export const initializeUserAccount = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            await setDoc(userRef, {
                balance: 1000,
                loans: 0,
                phoneNumber,
                lastLoanDate: null,
                creditScore: 750, 
                transactionHistory: [],
                loanHistory: [],
                language: "EN", // Default language
            });
        }
    } catch (error) {
        console.error("Error initializing user:", error);
    }
};

// 🔹 Fetch User Balance
export const getUserBalance = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
            return userSnapshot.data().balance;
        }
        return 0; 
    } catch (error) {
        console.error("Error fetching balance:", error);
        return 0;
    }
};

// 🔹 Fetch Credit Score
export const getCreditScore = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
            return `📊 Your Credit Score: ${userSnapshot.data().creditScore}`;
        }
        return "⚠️ Unable to fetch credit score.";
    } catch (error) {
        console.error("Error fetching credit score:", error);
        return "❌ Error fetching credit score.";
    }
};

// 🔹 Fetch Loan History
export const getLoanHistory = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
            return userSnapshot.data().loanHistory || [];
        }
        return [];
    } catch (error) {
        console.error("Error fetching loan history:", error);
        return [];
    }
};

// 🔹 Change Language
export const changeLanguage = async (phoneNumber, language) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        await updateDoc(userRef, { language });
        return language === "EN" ? "✅ Language changed to English." : "✅ भाषा हिंदी में बदल दी गई।";
    } catch (error) {
        console.error("Error changing language:", error);
        return "❌ Error changing language.";
    }
};

// 🔹 Function to Apply for a Loan & Update Balance with Daily Limit
export const applyForLoan = async (phoneNumber, amount, days) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            return "⚠️ User not found. Please login first.";
        }

        let userData = userSnapshot.data();
        let today = new Date().toISOString().split("T")[0];

        // Check daily loan limit
        if (userData.lastLoanDate === today && amount > 500) {
            return "⚠️ Max loan limit is ₹500 per day.";
        }

        let newLoanAmount = userData.loans + amount;
        let newBalance = userData.balance + amount;
        let interestRate = 0.05;
        let totalRepayment = amount + amount * interestRate * days;

        await updateDoc(userRef, {
            loans: newLoanAmount,
            balance: newBalance,
            lastLoanDate: today,
        });

        return `✅ Loan of ₹${amount} approved for ${days} days. Repay ₹${totalRepayment.toFixed(
            2
        )} (₹${(amount * interestRate * days).toFixed(2)} interest)`;
    } catch (error) {
        console.error("Error applying for loan:", error);
        return "❌ Loan request failed.";
    }
};

// 🔹 Get Total Loans Taken
export const getTotalLoans = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
            return userSnapshot.data().loans || 0;
        }
        return 0;
    } catch (error) {
        console.error("Error fetching total loans:", error);
        return 0;
    }
};

// 🔹 Get Remaining Loan Balance
export const getLoanBalance = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
            return userSnapshot.data().loans || 0;
        }
        return 0;
    } catch (error) {
        console.error("Error fetching loan balance:", error);
        return 0;
    }
};

// 🔹 Get Loan Due Date
export const getLoanDueDate = async (phoneNumber) => {
    try {
        return "📅 Your next loan repayment is due in 7 days.";
    } catch (error) {
        console.error("Error fetching loan due date:", error);
        return "❌ Unable to fetch due date.";
    }
};

// 🔹 Repay Loan
export const repayLoan = async (phoneNumber, amount) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            return "⚠️ User not found.";
        }

        let userData = userSnapshot.data();
        if (userData.loans < amount) {
            return "⚠️ You don't have that much loan to repay.";
        }

        let newLoanAmount = userData.loans - amount;
        let newBalance = userData.balance - amount;

        await updateDoc(userRef, {
            loans: newLoanAmount,
            balance: newBalance,
        });

        return `✅ Loan repayment of ₹${amount} successful. Remaining loan: ₹${newLoanAmount}`;
    } catch (error) {
        console.error("Error repaying loan:", error);
        return "❌ Repayment failed.";
    }
};

// 🔹 Get Transaction History
export const getTransactionHistory = async (phoneNumber) => {
    return "🔄 Recent Transactions:\n - ₹500 credited (Loan)\n - ₹200 debited (Repayment)";
};

// 🔹 Get Available Features
export const getAvailableCommands = async (language) => {
    if (language === "EN") {
        return "📢 Available Commands: BALANCE, LOAN <amount> <days>, REPAY <amount>, CREDIT SCORE, TRANSACTIONS, LOAN HISTORY, HINDI, ENGLISH.";
    } else {
        return "📢 उपलब्ध कमांड: BALANCE, LOAN <राशि> <दिन>, भुगतान <राशि>, CREDIT SCORE, लेनदेन, ऋण इतिहास, हिंदी, अंग्रेज़ी।";
    }
};

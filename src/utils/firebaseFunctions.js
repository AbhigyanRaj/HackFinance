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
                creditScore: 700,
            });
        }
    } catch (error) {
        console.error("Error initializing user:", error);
    }
};

// 🔹 AI-Based Loan Approval Logic
const isLoanApprovedByAI = (creditScore, amount) => {
    if (creditScore < 500) return false; // Users with low credit score are denied.
    if (creditScore > 750) return true;  // High credit score = Always approved.
    
    // Mid-range score: Approve loans < 5000, but reject higher amounts
    return amount <= 5000;
};

// 🔹 Apply for a Loan (Now AI-Based)
export const applyForLoan = async (phoneNumber, amount) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            return "⚠️ User not found. Please login first.";
        }

        let userData = userSnapshot.data();
        
        // AI-based Loan Approval
        if (!isLoanApprovedByAI(userData.creditScore, amount)) {
            return "❌ Loan request denied by AI due to low credit score.";
        }

        let newLoanAmount = userData.loans + amount;
        let newBalance = userData.balance + amount;

        await updateDoc(userRef, {
            loans: newLoanAmount,
            balance: newBalance,
            lastLoanDate: new Date().toISOString(),
        });

        // Store in Loan History
        const historyRef = collection(db, "users", phoneNumber, "loanHistory");
        await addDoc(historyRef, {
            amount: amount,
            type: "loan",
            timestamp: serverTimestamp(),
        });

        return `✅ Loan of ₹${amount} approved! New Balance: ₹${newBalance}.`;
    } catch (error) {
        console.error("Error applying for loan:", error);
        return "❌ Loan request failed.";
    }
};

// 🔹 Repay Loan (Now Improves Credit Score)
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

        // Increase credit score for successful repayment
        let newCreditScore = userData.creditScore + 20;
        if (newCreditScore > 850) newCreditScore = 850; // Max limit

        await updateDoc(userRef, {
            loans: newLoanAmount,
            balance: newBalance,
            creditScore: newCreditScore,
        });

        // Store in Loan History
        const historyRef = collection(db, "users", phoneNumber, "loanHistory");
        await addDoc(historyRef, {
            amount: amount,
            type: "repayment",
            timestamp: serverTimestamp(),
        });

        return `✅ Loan repayment of ₹${amount} successful. Remaining loan: ₹${newLoanAmount}. Credit Score improved to ${newCreditScore}.`;
    } catch (error) {
        console.error("Error repaying loan:", error);
        return "❌ Repayment failed.";
    }
};

// 🔹 Get Loan Details
export const getLoanDetails = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            return "⚠️ User not found.";
        }

        let userData = userSnapshot.data();
        return `📜 Loan Details:\n- Amount: ₹${userData.loans}\n- Last Loan Date: ${userData.lastLoanDate || "N/A"}\n- Credit Score: ${userData.creditScore}`;
    } catch (error) {
        console.error("Error fetching loan details:", error);
        return "❌ Error retrieving loan details.";
    }
};

// 🔹 Get Credit Score
export const getCreditScore = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            return "⚠️ User not found.";
        }

        let userData = userSnapshot.data();
        return `⭐ Your AI-evaluated Credit Score: ${userData.creditScore}`;
    } catch (error) {
        console.error("Error fetching credit score:", error);
        return "❌ Error retrieving credit score.";
    }
};

// 🔹 Get Feature List
export const getFeatureList = async () => {
    return `📜 Available Commands:
    - LOAN <amount> → Apply for a loan (AI-based approval)
    - REPAY <amount> → Repay your loan (Boosts credit score)
    - BALANCE → Check your balance
    - SCORE → Check your AI-evaluated credit score
    - LOAN DETAILS → See your loan details
    - HISTORY → View transaction history`;
};

// 🔹 Get Transaction History
export const getTransactionHistory = async (phoneNumber) => {
    try {
        const transactionsRef = collection(db, "transactions", phoneNumber, "history");
        const querySnapshot = await getDocs(query(transactionsRef, orderBy("timestamp", "desc")));

        let transactions = "🔄 Recent Transactions:\n";
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            transactions += ` - ₹${data.amount} ${data.type} on ${new Date(data.timestamp.seconds * 1000).toLocaleString()}\n`;
        });

        return transactions || "📜 No transaction history available.";
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        return "❌ Error retrieving transaction history.";
    }
};

// 🔹 Get User Balance
export const getUserBalance = async (phoneNumber) => {
    try {
        const userRef = doc(db, "users", phoneNumber);
        const userSnapshot = await getDoc(userRef);

        if (userSnapshot.exists()) {
            return userSnapshot.data().balance;
        }
        return 0;
    } catch (error) {
        console.error("Error fetching user balance:", error);
        return 0;
    }
};

// 🔹 Store Messages
export const storeMessage = async (phoneNumber, message, sender) => {
    try {
        const chatRef = collection(db, "messages", phoneNumber, "chatHistory");
        await addDoc(chatRef, {
            text: message,
            sender,
            timestamp: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error storing message:", error);
    }
};

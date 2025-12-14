import axios from "axios";

const url = "http://localhost:3000/complaints/updateStatusByEmployee/2";

async function sendRequest(token, label) {
  try {
    const res = await axios.patch(
      url,
      { status: "IN_PROGRESS",
        version: 1
       },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    console.log(label, "SUCCESS:", res.data.message);
  } catch (err) {
    console.log(label, "FAILED:", err.response?.data?.message);
  }
}

// Tokens لموظفين مختلفين
const token1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImVtcGxveWVlIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjU1NzgxMjgsImV4cCI6MTc2NjE4MjkyOH0.ZOpRojOPKZFJ0ykCH57UsYGD-te8PXO7VOY3V5EX-vg";
const token2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwicm9sZSI6ImVtcGxveWVlIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3NjU1NzgwOTYsImV4cCI6MTc2NjE4Mjg5Nn0.Z4-oPrPyIqJQZ3lmKfgZXzCDYqyN960MCIuGMfm0hzo";

// Send the two requests at the same time
Promise.all([
  sendRequest(token1, "EMPLOYEE 1"),
  sendRequest(token2, "EMPLOYEE 2"),
]).then(console.log);

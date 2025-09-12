// import { useState } from "react";
// import ReactMarkdown from "react-markdown";

// const ChatBot = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!inputMessage.trim()) return;

//     const newMessage = {
//       content: inputMessage,
//       sender: "user",
//       timestamp: new Date().toISOString(),
//     };

//     setMessages((prev) => [...prev, newMessage]);
//     setInputMessage("");
//     setIsLoading(true);

//     try {
//       const response = await fetch(
//         "https://api.together.xyz/v1/chat/completions",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${import.meta.env.VITE_TOGETHER_API}`,
//           },
//           body: JSON.stringify({
//             model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
//             messages: [
//               ...messages.map((msg) => ({
//                 role: msg.sender === "user" ? "user" : "assistant",
//                 content: msg.content,
//               })),
//               { role: "user", content: inputMessage },
//             ],
//             temperature: 0.7,
//             max_tokens: 1000,
//           }),
//         }
//       );

//       if (!response.ok) {
//         const errorData = await response.text();
//         throw new Error(`API Error: ${response.status} - ${errorData}`);
//       }

//       const data = await response.json();

//       if (!data.choices || !data.choices[0]?.message?.content) {
//         throw new Error("Invalid response format from API");
//       }

//       const botResponse = {
//         content: data.choices[0].message.content,
//         sender: "bot",
//         timestamp: new Date().toISOString(),
//       };

//       setMessages((prev) => [...prev, botResponse]);
//     } catch (error) {
//       console.error("Error:", error);
//       const errorMessage = {
//         content: `Error: ${error.message}`,
//         sender: "bot",
//         timestamp: new Date().toISOString(),
//       };
//       setMessages((prev) => [...prev, errorMessage]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const MessageContent = ({ content }) => (
//     <div style={{ overflow: "auto" }}>
//       <ReactMarkdown
//         components={{
//           h1: ({ children }) => (
//             <h1
//               style={{
//                 fontSize: "1.8em",
//                 fontWeight: "bold",
//                 margin: "0.5em 0",
//               }}
//             >
//               {children}
//             </h1>
//           ),
//           h2: ({ children }) => (
//             <h2
//               style={{
//                 fontSize: "1.5em",
//                 fontWeight: "bold",
//                 margin: "0.5em 0",
//               }}
//             >
//               {children}
//             </h2>
//           ),
//           p: ({ children }) => <p style={{ margin: "0.5em 0" }}>{children}</p>,
//           ul: ({ children }) => (
//             <ul style={{ marginLeft: "1.5em", listStyle: "disc" }}>
//               {children}
//             </ul>
//           ),
//           ol: ({ children }) => (
//             <ol style={{ marginLeft: "1.5em" }}>{children}</ol>
//           ),
//           li: ({ children }) => (
//             <li style={{ margin: "0.2em 0" }}>{children}</li>
//           ),
//           strong: ({ children }) => (
//             <strong style={{ fontWeight: "bold" }}>{children}</strong>
//           ),
//         }}
//       >
//         {content}
//       </ReactMarkdown>
//     </div>
//   );

//   return (
//     <div
//       className="qora"
//       style={{  margin: "0 15%", padding: "20px" }}
//     >
//       <h2>FDRS Chatbot</h2>
//       <div
//         style={{
//           width: "100%",
//           height: "400px",
//           overflowY: "auto",
//           border: " 1px solid #333",
//           padding: " 20px",
//           margin: " 4% 0",
//           borderRadius: " 5rem",
//         }}
//       >
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             style={{
//               marginBottom: "15px",
//               padding: "10px",
//               // backgroundColor: message.sender === "user" ? "#f0f0f0" : "#fff",
//               backgroundColor:"#fff",
//               borderRadius: "5px",
//             }}
//           >
//             <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
//               {message.sender === "user" ? "You" : "FDRS"}:
//             </div>
//             <MessageContent content={message.content} />
//             <div style={{ fontSize: "0.8em", color: "#666", marginTop: "5px" }}>
//               {new Date(message.timestamp).toLocaleTimeString()}
//             </div>
//           </div>
//         ))}
//         {isLoading && <div>Processing...</div>}
//       </div>

//       <form
//         onSubmit={handleSendMessage}
//         style={{ display: "flex", gap: "10px" }}
//       >
//         <input
//           type="text"
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           placeholder="Type your message..."
//           disabled={isLoading}
//           style={{
//             flex: 1,
//             padding: "10px",
//             borderRadius: "2rem",
//             border: "1px solid #ccc",
//           }}
//         />
//         <button
//           type="submit"
//           className="btnct"
//           disabled={isLoading}
//           style={{
//             padding: "2% 6%",
//             borderRadius: "1em",
//             border: "none",
//             backgroundColor: "rgb(0, 0, 0)",
//             color: "white",
//             cursor: "pointer",
//             maxWidth: "15rem",
//             fontSize: "20px",
//             marginLeft: "0em",
//           }}  
//         >
//           Send <span>↗</span>  
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatBot;

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import "./App.css";
import CoinFlipABI from "./CoinFlipABI.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [betAmount, setBetAmount] = useState("");
  const [isHeads, setIsHeads] = useState(true);
  const [result, setResult] = useState(null);
  const [account, setAccount] = useState(null);
  const [contractBalance, setContractBalance] = useState("0");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // "success" or "error"

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(newProvider);
    } else {
      console.log("Please install MetaMask!");
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contract = new ethers.Contract(
          contractAddress,
          CoinFlipABI,
          signer
        );
        setSigner(signer);
        setContract(contract);

        const balance = await provider.getBalance(contractAddress);
        setContractBalance(ethers.utils.formatEther(balance));

        setMessage(`Connected account: ${address}`);
        setMessageType("success");
        console.log("Connected account:", address);
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setMessage("Error connecting wallet. Please try again.");
        setMessageType("error");
      }
    } else {
      console.error("MetaMask is not installed");
      setMessage("MetaMask is not installed. Please install MetaMask.");
      setMessageType("error");
    }
  };

  const flipCoin = async () => {
    if (!contract || !signer) {
      console.error("Contract or signer not set");
      setMessage("Contract or signer not set. Please try again.");
      setMessageType("error");
      return;
    }

    try {
      const gasLimit = 100000;
      const tx = await contract.flipCoin(isHeads, {
        value: ethers.utils.parseEther(betAmount),
        gasLimit: gasLimit,
      });
      await tx.wait();

      const receipt = await provider.getTransactionReceipt(tx.hash);
      const event = receipt.logs.find((log) =>
        log.topics.includes(contract.interface.getEventTopic("Result"))
      );
      const decodedEvent = contract.interface.parseLog(event);
      const win = decodedEvent.args[0];

      setResult(win ? "You won!" : "You lost!");
      setMessage(
        win ? "Congratulations! You won the flip!" : "Sorry, you lost the flip."
      );
      setMessageType(win ? "success" : "error");
      console.log("Coin flip executed!");

      const updatedBalance = await provider.getBalance(contractAddress);
      setContractBalance(ethers.utils.formatEther(updatedBalance));
    } catch (error) {
      console.error("Error executing coin flip:", error);
      setMessage("An error occurred during the flip. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <div className="container">
      <Typography variant="h4" gutterBottom>
        <b className="heading1">CoinFlip Game</b>
      </Typography>
      <Button variant="contained" color="secondary" onClick={connectWallet}>
        {account ? `Connected: ` : "Connect Wallet"}
      </Button>

      <div className="input-section">
        <TextField
          label="Bet Amount (ETH)"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          type="number"
          inputProps={{ style: { color: "#fff" } }}
          variant="outlined"
          fullWidth
          sx={{ input: { color: "#fff" }, label: { color: "#fff" } }}
        />
      </div>
      <div className="button-group">
        <Button
          variant="contained"
          style={{ backgroundColor: isHeads ? "#6c5ce7" : "#2d3436" }}
          onClick={() => setIsHeads(true)}
        >
          Heads
        </Button>
        &nbsp; &nbsp; &nbsp; &nbsp;
        <Button
          variant="contained"
          style={{ backgroundColor: !isHeads ? "#6c5ce7" : "#2d3436" }}
          onClick={() => setIsHeads(false)}
        >
          Tails
        </Button>
      </div>
      <div className="flip-button">
        <Button variant="contained" color="success" onClick={flipCoin}>
          Flip Coin
        </Button>
      </div>

      {message && (
        <div className={`alert-box ${messageType}`}>
          <h4>{messageType === "success" ? "Success" : "Error"}</h4>
          {/* Displaying the message inside the box */}
        </div>
      )}

      {result && (
        <Typography variant="h5" style={{ marginTop: "20px", color: "#fff" }}>
          {result}
        </Typography>
      )}
    </div>
  );
}

export default App;

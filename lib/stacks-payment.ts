import {
  uintCV,
} from "@stacks/transactions";
import { STACKS_TESTNET } from "@stacks/network"; // <-- Added import

interface PaymentPayload {
  escrowId: number; // Received from your backend server
  amountInMicroStx: number; // e.g., 50000000 for 50 STX
  buyerAddress: string; // The logged-in buyer's wallet address
  contractAddress: string; // Stacks contract address
  contractName: string; // Contract name for escrow
}

interface PaymentResult {
  success: boolean;
  txId?: string;
  error?: string;
}

/**
 * Fund an escrow order by calling the contract via user's wallet
 * Opens the Stacks wallet extension popup for user to approve/sign the transaction
 *
 * @param payload Payment details
 * @returns Promise that resolves when user confirms/cancels transaction
 */
export async function payForEscrowOrder(
  payload: PaymentPayload
): Promise<PaymentResult> {
  const {
    escrowId,
    contractAddress,
    contractName,
  } = payload;

  return new Promise(async (resolve) => {
    try {
      const { openContractCall } = await import("@stacks/connect");
      // 2. Open the Wallet Extension Popup
      openContractCall({
      network: STACKS_TESTNET,
        contractAddress,
        contractName,
        functionName: "fund-escrow",
        functionArgs: [uintCV(escrowId)], // Pass the specific on-chain escrow ID to fund
        // Note: Post-conditions can be added for additional security
        // postConditions: [...],

        // Triggered instantly when the user clicks "Confirm" inside the wallet extension
        onFinish: async (data) => {
          console.log("Transaction successfully broadcasted to network!");
          console.log("Transaction ID (TxID):", data.txId);

          try {
            // Send the TxID to your backend so your system can monitor the Stacks blockchain
            // for confirmation blocks and officially mark the order as "Paid" in your DB.
            const updateResponse = await fetch("/api/orders/update-status", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                txId: data.txId,
                escrowId: escrowId,
              }),
            });

            if (updateResponse.ok) {
              console.log("Backend notified of payment transaction");
              resolve({
                success: true,
                txId: data.txId,
              });
            } else {
              console.error("Failed to notify backend of payment");
              resolve({
                success: true,
                txId: data.txId,
                error: "Backend notification failed",
              });
            }
          } catch (err) {
            console.error("Error notifying backend:", err);
            resolve({
              success: true,
              txId: data.txId,
              error:
                err instanceof Error ? err.message : "Backend error occurred",
            });
          }
        },

        // Triggered if the user closes or rejects the wallet popup
        onCancel: () => {
          console.warn("Payment transaction was declined by the user.");
          resolve({
            success: false,
            error: "Payment cancelled by user",
          });
        },
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      resolve({
        success: false,
        error: error instanceof Error ? error.message : "Payment error",
      });
    }
  });
}

/**
 * Convert STX amount to microSTX
 * @param stxAmount Amount in STX
 * @returns Amount in microSTX
 */
export function toMicroStx(stxAmount: number | string): number {
  const amount = typeof stxAmount === "string" ? parseFloat(stxAmount) : stxAmount;
  return Math.floor(amount * 1000000);
}

/**
 * Convert microSTX to STX
 * @param microStxAmount Amount in microSTX
 * @returns Amount in STX
 */
export function fromMicroStx(microStxAmount: number): number {
  return microStxAmount / 1000000;
}

/**
 * Format STX amount for display
 * @param amount Amount in microSTX or STX
 * @param isMicroStx Whether amount is in microSTX (default false, assumes STX)
 * @returns Formatted string
 */
export function formatStxAmount(
  amount: number | string,
  isMicroStx: boolean = false
): string {
  const numAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;
  const stxAmount = isMicroStx ? fromMicroStx(numAmount) : numAmount;
  return `${stxAmount.toFixed(6)} STX`;
}

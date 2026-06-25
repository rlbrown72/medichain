import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { db } from "./aws-config";

export async function fetchAllPatients() {
  const command = new ScanCommand({
    TableName: "Patients", // Matches your manual table name perfectly
  });

  try {
    const response = await db.send(command);
    return response.Items || [];
  } catch (error) {
    console.error("Failed to fetch patients from live DynamoDB:", error);
    return [];
  }
}
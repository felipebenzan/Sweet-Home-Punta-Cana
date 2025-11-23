'use server';

import { initializeFirebaseAdmin } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";
import { getStorage } from "firebase-admin/storage";

export async function deleteExcursion(excursionId: string, imageUrl: string) {
  try {
    const { app, db } = initializeFirebaseAdmin();
    const storage = getStorage(app);
    const firestore = db;

    // 1. Delete image from Firebase Storage
    if (imageUrl) {
      const decodedUrl = decodeURIComponent(imageUrl);
      if (decodedUrl.includes("/o/") && decodedUrl.includes("?alt=media")) {
          const pathStartIndex = decodedUrl.indexOf("/o/") + 3;
          const pathEndIndex = decodedUrl.indexOf("?alt=media");
          const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);
          
          if (filePath) {
            const file = storage.bucket().file(filePath);
            await file.delete();
          }
      } else {
        console.warn(`Could not parse Firebase Storage URL: ${imageUrl}`);
      }
    }

    // 2. Delete document from Firestore
    const excursionRef = firestore.collection("excursions").doc(excursionId);
    await excursionRef.delete();

    // 3. Revalidate the path to refresh the UI
    revalidatePath("/admin/excursions");
    
    return { success: true };

  } catch (error) {
    console.error("Error deleting excursion:", error);
    return { success: false, error: "Failed to delete excursion." };
  }
}

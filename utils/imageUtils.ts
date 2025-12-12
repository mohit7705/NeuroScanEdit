export const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // result is in format "data:image/png;base64,....."
      // We need to split it to get the raw base64 data and the mime type.
      const match = result.match(/^data:(.+);base64,(.+)$/);
      if (match) {
        resolve({
          mimeType: match[1],
          data: match[2],
        });
      } else {
        reject(new Error("Failed to parse base64 string"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToBlobUrl = (base64Data: string, mimeType: string = 'image/png'): string => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });
  return URL.createObjectURL(blob);
};
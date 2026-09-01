import { create } from "zustand";

const useUIStore = create((set) => ({
  selectedChatId: null,
  selectedDocumentId: null,

  setSelectedChatId: (chatId) =>
    set({
      selectedChatId: chatId,
    }),

  setSelectedDocumentId: (documentId) =>
    set({
      selectedDocumentId: documentId,
    }),

  clearSelection: () =>
    set({
      selectedChatId: null,
      selectedDocumentId: null,
    }),
}));

export default useUIStore;

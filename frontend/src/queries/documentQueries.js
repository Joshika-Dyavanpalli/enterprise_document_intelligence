import { useMutation, useQuery } from "@tanstack/react-query";
import api from "../services/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

export const useUploadDocument = () => {
  return useMutation({
    mutationFn: async ({ file, chatId }) => {
      const formData = new FormData();

      formData.append("document", file);
      formData.append("chatId", chatId);

      const response = await api.post("/auth/upload", formData, {
        headers: getAuthHeaders(),
      });

      return response.data;
    },
  });
};

export const useDocumentStatus = (documentId) => {
  return useQuery({
    queryKey: ["document", documentId],
    queryFn: async () => {
      const response = await api.get(`/auth/document/${documentId}`, {
        headers: getAuthHeaders(),
      });

      return response.data.document;
    },

    enabled: Boolean(documentId),

    refetchInterval: (query) => {
      const status = query.state.data?.processingStatus;

      if (status === "completed" || status === "failed") {
        return false;
      }

      return 2000;
    },
  });
};

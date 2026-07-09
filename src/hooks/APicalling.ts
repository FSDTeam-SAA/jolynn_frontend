import { changePassword, getProfile, updateAvatarInfo, updateProfile } from "@/lib/profileInfo";
import { UserResponse } from "@/types/userProfiledata";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useProfileAvatarUpdate(token: string, onSuccessCallback?: () => void) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: File) => updateAvatarInfo(token, payload),
        onSuccess: () => {
            toast.success("Profile image updated successfully");
            queryClient.invalidateQueries({ queryKey: ["me"] });
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error: unknown) => {
            if (error instanceof Error) toast.error(error.message || "Update failed");
            else toast.error("Update failed");
        },
    });
}

export function useChnagePassword(
    token: string, onSuccessCallback?: () => void) {
    return useMutation({
        mutationFn: (payload: { oldPassword: string; newPassword: string, confirmPassword: string }) =>
            changePassword(token, payload),
        onSuccess: (data) => {
            toast.success(data?.message || "Password updated successfully");
            if (onSuccessCallback) onSuccessCallback();
        },
        onError: (error: unknown) => {
            if (error instanceof Error) toast.error(error.message || "Update failed");
            else toast.error("Update failed");
        },
    });
}

export function useProfileQuery(token: string | undefined, id: string | undefined) {
    return useQuery<UserResponse>({
        queryKey: ["me"],
        queryFn: () => {
            if (!token) throw new Error("Token is missing")
            return getProfile(token, id)
        },
        enabled: !!token,
    })
}

export function useProfileUpdate(
    token: string, id: string, onSuccessCallback?: () => void) {
     const queryClient = useQueryClient();
        return useMutation({
        mutationFn: (payload:{ firstName: string; lastName: string; email: string; phoneNumber: string; address: string;}) =>
            updateProfile(token, payload, id),
        onSuccess: (data) => {
            toast.success(data?.message || "Password updated successfully");
            if (onSuccessCallback) onSuccessCallback();
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
        onError: (error: unknown) => {
            if (error instanceof Error) toast.error(error.message || "Update failed");
            else toast.error("Update failed");
        },
    });
}
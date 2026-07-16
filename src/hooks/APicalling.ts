import { changePassword, ChangePasswordPayload, getProfile, updateAvatarInfo, updateProfile, UpdateProfilePayload, UpdateProfileResponse } from "@/lib/profileInfo";
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

export function useChangePassword(
    token: string | undefined, onSuccessCallback?: () => void) {
    return useMutation({
        mutationKey: ["change-password"],
        mutationFn: (payload: ChangePasswordPayload) => {
            if (!token) throw new Error("You must be signed in to change your password");
            return changePassword(token, payload);
        },
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

export function useProfileQuery(token: string | undefined) {
    return useQuery<UserResponse>({
        queryKey: ["me"],
        queryFn: () => {
            if (!token) throw new Error("Token is missing")
            return getProfile(token)
        },
        enabled: !!token,
    })
}

export function useProfileUpdate(
    token: string | undefined, onSuccessCallback?: (data: UpdateProfileResponse) => void) {
     const queryClient = useQueryClient();
        return useMutation({
        mutationKey: ["update-profile"],
        mutationFn: (payload: UpdateProfilePayload) => {
            if (!token) throw new Error("You must be signed in to update your profile");
            return updateProfile(token, payload);
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Profile updated successfully");
            if (onSuccessCallback) onSuccessCallback(data);
            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
        onError: (error: unknown) => {
            if (error instanceof Error) toast.error(error.message || "Update failed");
            else toast.error("Update failed");
        },
    });
}

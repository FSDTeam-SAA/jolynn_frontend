


export async function getProfile(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
  })
  const resData = await response.json()
  if (!response.ok || !resData?.success) {
    throw new Error(resData.message || "Failed to get profile")
  }
  return resData
}


export async function updateAvatarInfo(token: string, payload: File) {
  const formData = new FormData();
  if (payload) formData.append("avatar", payload);

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/update-avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(resData.message || "Failed to update profile image");
  return resData;
}


export type ChangePasswordPayload = {
  oldPassword: string;
  newPassword: string;
};

export async function changePassword(token: string, payload: ChangePasswordPayload) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      accept: "*/*",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const resData = await response.json();
  if (!response.ok || !resData?.success) {
    throw new Error(resData?.message || "Failed to change password");
  }
  return resData;
}

export type UpdateProfilePayload = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  state: string;
  country: string;
  postcode: string;
  gender: "male" | "female";
  profilePicture?: File;
};

export type UpdateProfileResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: Partial<Omit<UpdateProfilePayload, "profilePicture">> & {
    _id: string;
    profilePicture?: string;
  };
};

export async function updateProfile(
  token: string,
  payload: UpdateProfilePayload,
): Promise<UpdateProfileResponse> {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    formData.append(key, value);
  });

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
    method: "PUT",
    headers: {
      accept: "*/*",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(resData.message || "Failed to update profile");
  return resData;
}

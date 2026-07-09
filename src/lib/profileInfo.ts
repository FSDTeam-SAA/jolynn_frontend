


export async function getProfile(token: string, id?: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  const resData = await response.json()
  if (!response.ok) {
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


export async function changePassword(token: string, payload: { oldPassword: string; newPassword: string, confirmPassword: string }) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(resData.message || "Failed to update password");
  return resData;
}

export async function updateProfile(token: string, payload:{ firstName: string; lastName: string; email: string; phoneNumber: string; address: string;},id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/update-user/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const resData = await response.json();
  if (!response.ok) throw new Error(resData.message || "Failed to update profile");
  return resData;
}
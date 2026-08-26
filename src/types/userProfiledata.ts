export interface UserResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    _id: string
    firstName?: string
    lastName?: string
    fullName?: string
    email: string
    phoneNumber: string
    address?: string
    city?: string
    state?: string
    country?: string
    postcode?: string
    gender: "male" | "female"
    username: string
    role: string
    roles?: string[]
    defaultRole?: string
    status: string
    tag: string
    createdAt: string
    updatedAt: string
    __v: number
    profilePicture?: string
    businessName?: string
    businessEmail?: string
    businessWebsiteUrl?: string
    serviceArea?: string
    category?: string
    bio?: string
  }
}

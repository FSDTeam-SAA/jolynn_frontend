export interface UserResponse {
  status: boolean
  message: string
  data: {
    _id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    address: string
    designation: string
    role: string
    createdAt: string
    updatedAt: string
    __v: number
    profileImage: string
  }
}

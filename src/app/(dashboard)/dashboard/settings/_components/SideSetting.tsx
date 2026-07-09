"use client"

import { useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, Key, User, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { useProfileAvatarUpdate, useProfileQuery } from "@/hooks/APicalling"
import { useSession } from "next-auth/react"

export function SideSetting() {
    const [imageUrl, setImageUrl] = useState<string | undefined>()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const pathname = usePathname()
    const session = useSession()
    const token = (session?.data?.user as { token: string })?.token
    const id = (session?.data?.user as { id: string })?.id

    const setAvatar = useProfileAvatarUpdate(token)
    const { data } = useProfileQuery(token, id)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {

            setAvatar.mutate(file)
            const fileUrl = URL.createObjectURL(file)
            setImageUrl(fileUrl)
        }
    }

    const handleAvatarClick = () => {
        if (!setAvatar.isPending) {
            fileInputRef.current?.click()
        }
    }

    return (
        <Card className="w-full max-w-[408px] overflow-hidden border-0 shadow-lg">
            <div
                className="h-44"
                style={{
                    background: "linear-gradient(135deg, #82B7B4 0%, #EAFFFE 100%)",
                }}
            />
            <div className="relative px-6 pb-6">
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div
                    className="absolute -top-16 left-1/2 -translate-x-1/2 cursor-pointer"
                    onClick={handleAvatarClick}
                >
                    <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-md">
                            <AvatarImage
                                src={imageUrl || data?.data.profileImage || "/placeholder.svg"}
                                alt="Profile Image"
                                className={clsx(setAvatar.isPending && "opacity-50")}
                            />
                            <AvatarFallback className="text-2xl bg-gray-200 text-gray-600">
                                {data?.data.firstName?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        {/* ✅ Loading Overlay */}
                        {setAvatar.isPending && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-full">
                                <Loader2 className="h-8 w-8 text-[#82B7B4] animate-spin" />
                            </div>
                        )}

                        <div className="absolute bottom-2 right-2 bg-white rounded-full p-0.5">
                            <CheckCircle2 className="h-6 w-6 text-teal-500 fill-teal-500" />
                        </div>
                    </div>
                </div>

                {/* Name and Role */}
                <div className="pt-20 text-center mb-6">
                    <h2 className="text-xl font-semibold text-[#82B7B4] mb-1">{data?.data.firstName}</h2>
                    <p className="text-sm text-gray-500">{data?.data.role}</p>
                </div>

                {/* Information List */}
                <div className="space-y-3">
                    <InfoRow label="Name:" value={data?.data.firstName + " " + data?.data.lastName} />
                    <InfoRow label="Email:" value={data?.data.email || ""} />
                    <InfoRow label="Phone:" value={data?.data.phoneNumber || ""} />
                    <InfoRow label="Location:" value={data?.data.address || ""} />
                    <InfoRow label="designation" value={data?.data.designation || ""} />
                </div>

                {/* Menus */}
                <div className="mt-8">
                    <h2 className="text-[#343A40] font-semibold mb-3">Menus</h2>
                    <div className="space-y-[16px] rounded-lg">
                        <Link
                            href="/dashboard/settings/profile"
                            className={clsx(
                                "flex gap-4 cursor-pointer rounded-lg py-[9px] border border-[#E7E7E7] px-[16px] font-semibold text-[14px]",
                                pathname === "/dashboard/settings/profile"
                                    ? "bg-[#EEEEEE] text-[#343A40]"
                                    : "text-[#343A40]"
                            )}
                        >
                            <User /> Personal Information
                        </Link>

                        <Link
                            href="/dashboard/settings/password"
                            className={clsx(
                                "flex gap-6 cursor-pointer rounded-lg py-[9px] border border-[#E7E7E7] px-[16px] font-semibold text-[14px]",
                                pathname === "/dashboard/settings/password"
                                    ? "bg-[#EEEEEE] text-[#343A40]"
                                    : "text-[#343A40]"
                            )}
                        >
                            <Key /> Password
                        </Link>
                    </div>
                </div>
            </div>
        </Card>
    )
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex text-sm gap-3">
            <span className="text-[#5B6574] font-medium text-[16px]">{label}</span>
            <span className="text-[#68706A]">{value}</span>
        </div>
    )
}

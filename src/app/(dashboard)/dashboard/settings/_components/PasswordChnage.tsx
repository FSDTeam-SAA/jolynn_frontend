"use client"

import {
    useForm
} from "react-hook-form"
import {
    zodResolver
} from "@hookform/resolvers/zod"
import {
    z
} from "zod"

import {
    Button
} from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Card, CardContent } from "@/components/ui/card"
import { PasswordInput } from "@/components/ui/password-input"
import { useChnagePassword } from "@/hooks/APicalling"
import { signOut, useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"


const formSchema = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmPassword: z.string()
});

export default function PasswordChange() {
    const session = useSession()
    const token = (session?.data?.user as { token: string })?.token

    const changePasswrdMutation = useChnagePassword(token);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),

    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        changePasswrdMutation.mutate({
            oldPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword
        });
        if (changePasswrdMutation.status === 'success') {
            form.reset();
            signOut({ callbackUrl: '/login' });
        }
    }

    return (
        <Card className="w-full">
            <CardContent>
                <Form {...form}>
                    <h2 className="text-3xl mt-8 text-[#343A40 font-semibold]">Changes Password</h2>
                    <p className="text-[#68706A] text-[16px] ">Manage your account preferences, security settings, and privacy options.</p>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8   py-10">

                        <div className="grid grid-cols-12 gap-4">

                            <div className="col-span-6">

                                <FormField
                                    control={form.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput placeholder="Current Password" {...field} />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>

                            <div className="col-span-6">

                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>New  Password</FormLabel>
                                            <FormControl>
                                                <PasswordInput placeholder="New  Password" {...field} />
                                            </FormControl>

                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                            </div>

                        </div>

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New  Password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="Confirm New  Password" {...field} />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" className="bg-[#76A7A4] hover:bg-[#76A7A4]/90">Save Changes {changePasswrdMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}</Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

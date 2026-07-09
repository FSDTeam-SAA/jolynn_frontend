// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";

// import { Button } from "@/components/ui/button";
// import {
//     Form,
//     FormControl,
//     FormField,
//     FormItem,
//     FormLabel,
//     FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card";
// import { Calendar } from "@/components/ui/calendar";
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger,
// } from "@/components/ui/popover";
// import { CalendarIcon, Loader2 } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "@/lib/utils";
// import { useProfileUpdate } from "@/hooks/APicalling";
// import { useSession } from "next-auth/react";

// const formSchema = z.object({
//     firstName: z.string().min(1),
//     lastName: z.string().min(1),
//     emailAddress: z.string().email(),
//     phoneNumber: z.string().min(1),
//     address: z.string().min(1),
//     joiningDate: z.date().optional(),
//     designation: z.string().min(1),
//     accessLevels: z.string().min(1),
//     lastoginTime: z.string().min(1),
// });

// export default function PersonalInfo() {
//     const form = useForm<z.infer<typeof formSchema>>({
//         resolver: zodResolver(formSchema),
//         defaultValues: {
//             firstName: "",
//             lastName: "",
//             emailAddress: "",
//             phoneNumber: "",
//             address: "",
//             joiningDate: undefined,
//             designation: "",
//             accessLevels: "",
//             lastoginTime: "",
//         },
//     });
//     const session = useSession()
//     const token = (session?.data?.user as { token: string })?.token
//     const id = (session?.data?.user as { id: string })?.id

//     const updateMutation = useProfileUpdate(token, id);


//     function onSubmit(values: z.infer<typeof formSchema>) {
//         const payload = {
//             firstName: values.firstName,
//             lastName: values.lastName,
//             email: values.emailAddress,
//             phoneNumber: values.phoneNumber,
//             address: values.address,
//             joiningDate: values.joiningDate ?? new Date(),
//             designation: values.designation,
//             accessLevels: values.accessLevels,
//             lastoginTime: values.lastoginTime,
//         }
//         updateMutation.mutate(payload)
//     }

//     return (
//         <Card className="w-full">
//             <CardContent>
//                 <Form {...form}>
//                     <h2 className="text-3xl mt-8 text-[#343A40 font-semibold]">Personal Information</h2>
//                     <p className="text-[#68706A] text-[16px] ">Manage your personal information and profile details.</p>
//                     <form
//                         onSubmit={form.handleSubmit(onSubmit)}
//                         className="space-y-8  mx-auto py-10"
//                     >
//                         <div className="grid grid-cols-12 gap-4">
//                             <div className="col-span-6">
//                                 <FormField
//                                     control={form.control}
//                                     name="firstName"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-[#434C45] font-medium">First Name</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="First Name" type="text" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <div className="col-span-6">
//                                 <FormField
//                                     control={form.control}
//                                     name="lastName"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-[#434C45] font-medium">Last Name</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Last Name" type="text" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-12 gap-4">
//                             <div className="col-span-6">
//                                 <FormField
//                                     control={form.control}
//                                     name="emailAddress"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-[#434C45] font-medium">Email Address</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Email Address" type="email" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <div className="col-span-6">
//                                 <FormField
//                                     control={form.control}
//                                     name="phoneNumber"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-[#434C45] font-medium">Phone Number</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Phone Number" type="text" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-12 gap-4">
//                             <div className="col-span-6">
//                                 <FormField
//                                     control={form.control}
//                                     name="address"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-[#434C45] font-medium">Address</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Address" type="text" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>


//                             <div className="col-span-6">
//                                 <FormField
//                                     control={form.control}
//                                     name="joiningDate"
//                                     render={({ field }) => (
//                                         <FormItem className="flex flex-col py-3">
//                                             <FormLabel className="text-[#434C45] font-medium">Joining Date</FormLabel>
//                                             <Popover>
//                                                 <PopoverTrigger asChild>
//                                                     <FormControl>
//                                                         <Button
//                                                             variant={"outline"}
//                                                             className={cn(
//                                                                 "w-full justify-start text-left font-normal",
//                                                                 !field.value && "text-muted-foreground"
//                                                             )}
//                                                         >
//                                                             {field.value ? (
//                                                                 format(field.value, "PPP")
//                                                             ) : (
//                                                                 <span>Select date</span>
//                                                             )}
//                                                             <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
//                                                         </Button>
//                                                     </FormControl>
//                                                 </PopoverTrigger>
//                                                 <PopoverContent align="start" className="p-0">
//                                                     <Calendar
//                                                         mode="single"
//                                                         selected={field.value}
//                                                         onSelect={field.onChange}
//                                                         disabled={(date) =>
//                                                             date > new Date() || date < new Date("1900-01-01")
//                                                         }
//                                                         initialFocus
//                                                     />
//                                                 </PopoverContent>
//                                             </Popover>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-12 gap-4">
//                             <div className="col-span-4">
//                                 <FormField
//                                     control={form.control}
//                                     name="designation"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-[#434C45] font-medium">Designation</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Designation" type="text" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <div className="col-span-4">
//                                 <FormField
//                                     control={form.control}
//                                     name="accessLevels"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-[#434C45] font-medium">Access Levels</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Access Levels" type="text" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>

//                             <div className="col-span-4">
//                                 <FormField
//                                     control={form.control}
//                                     name="lastoginTime"
//                                     render={({ field }) => (
//                                         <FormItem>
//                                             <FormLabel className="text-[#434C45] font-medium">Last Login Time</FormLabel>
//                                             <FormControl>
//                                                 <Input placeholder="Last Login Time" type="text" {...field} />
//                                             </FormControl>
//                                             <FormMessage />
//                                         </FormItem>
//                                     )}
//                                 />
//                             </div>
//                         </div>
//                         <div className=" flex items-center justify-end">

//                             <Button type="submit" className="bg-[#76A7A4] py-4 px-6 hover:bg-[#76A7A4]/90 text-white" >Submit {updateMutation.isPending && <Loader2 className="animate-spin mr-2" />}</Button>
//                         </div>
//                     </form>
//                 </Form>
//             </CardContent>
//         </Card>
//     );
// }

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useProfileQuery, useProfileUpdate } from "@/hooks/APicalling";

const formSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    emailAddress: z.string().email(),
    phoneNumber: z.string().min(1),
    address: z.string().min(1),
    joiningDate: z.date().optional(),
    designation: z.string().min(1),
    accessLevels: z.string().optional(),
    lastoginTime: z.string().optional(),
});

export default function PersonalInfo() {
    const { data: session } = useSession();
    const token = (session?.user as { token: string })?.token;
    const id = (session?.user as { id: string })?.id;

    const updateMutation = useProfileUpdate(token, id);
    const { data: userInfo } = useProfileQuery(token, id);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            emailAddress: "",
            phoneNumber: "",
            address: "",

        },
    });

    // ✅ Populate form when API data is loaded
    useEffect(() => {
        if (userInfo?.data) {
            const data = userInfo.data;
            form.reset({
                firstName: data.firstName || "",
                lastName: data.lastName || "",
                emailAddress: data.email || "",
                phoneNumber: data.phoneNumber || "",
                address: data.address || "",
                joiningDate: data.createdAt ? new Date(data.createdAt) : undefined,
                designation: data.role || "",
            });
        }
    }, [userInfo, form]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        const payload = {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.emailAddress,
            phoneNumber: values.phoneNumber,
            address: values.address,
        };
        updateMutation.mutate(payload);
    }

    return (
        <Card className="w-full">
            <CardContent>
                <Form {...form}>
                    <h2 className="text-3xl mt-8 text-[#343A40] font-semibold">
                        Personal Information
                    </h2>
                    <p className="text-[#68706A] text-[16px]">
                        Manage your personal information and profile details.
                    </p>

                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8 mx-auto py-10"
                    >
                        {/* --- Name Fields --- */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name="firstName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="First Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name="lastName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Last Name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* --- Contact Fields --- */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name="emailAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input disabled type="email" placeholder="Email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name="phoneNumber"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Phone Number" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* --- Address & Date --- */}
                        <div className="grid grid-cols-12 gap-4">
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Address" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-6">
                                <FormField
                                    control={form.control}
                                    name="joiningDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col py-3">
                                            <FormLabel>Joining Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            disabled
                                                            className={cn(
                                                                "w-full justify-start text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Select date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent align="start" className="p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        disabled={(date) =>
                                                            date > new Date() ||
                                                            date < new Date("1900-01-01")
                                                        }
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* --- Role Info --- */}
                        <div className="grid grid-cols-12  gap-4">
                            <div className="col-span-12">
                                <FormField
                                    control={form.control}
                                    name="designation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Role</FormLabel>
                                            <FormControl>
                                                <Input disabled placeholder="Designation" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            {/* <div className="col-span-4">
                                <FormField
                                    control={form.control}
                                    name="accessLevels"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Access Levels</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Access Levels" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="col-span-4">
                                <FormField
                                    control={form.control}
                                    name="lastoginTime"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Login Time</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Last Login Time" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div> */}
                        </div>

                        {/* --- Submit --- */}
                        <div className="flex items-center justify-end">
                            <Button
                                type="submit"
                                className="bg-[#76A7A4] py-4 px-6 hover:bg-[#76A7A4]/90 text-white"
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending && (
                                    <Loader2 className="animate-spin mr-2" />
                                )}
                                Submit
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}

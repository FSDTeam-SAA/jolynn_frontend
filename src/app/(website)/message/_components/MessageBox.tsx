"use client";

import React, { useState, useRef, useEffect, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Search,
  Send,

  ImageIcon,

  CheckCheck,


  ArrowLeft,
  Paperclip,
  Download,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileQuery } from "@/hooks/APicalling";
import {
  useUserConversations,
  useBusinessConversations,
  useUserConversationMessages,
  useBusinessConversationMessages,
  useSendUserReply,
  useSendBusinessReply,
  ApiConversation,
  ApiMessage,
} from "@/hooks/use-messages";

interface MessageBoxProps {
  mode?: "user" | "business";
  heightClass?: string;
  className?: string;
}

function MessageBoxContent({
  mode = "user",
  heightClass = "h-[calc(100vh-160px)]",
  className,
}: MessageBoxProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get("conversationId");

  const sessionUser = session?.user as
    | { token?: string; accessToken?: string; id?: string; _id?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;

  // Profile data to match current sender ID
  const { data: profileResponse } = useProfileQuery(token);
  const currentUserId =
    profileResponse?.data?._id || sessionUser?.id || sessionUser?._id;

  // Conversations API
  const isUserMode = mode === "user";
  const userConversationsQuery = useUserConversations(
    token,
    1,
    50
  );
  const businessConversationsQuery = useBusinessConversations(
    token,
    1,
    50
  );

  const activeConversationsQuery = isUserMode
    ? userConversationsQuery
    : businessConversationsQuery;
  const conversations: ApiConversation[] =
    activeConversationsQuery.data?.data || [];

  // Selected Active Conversation State
  const [activeContactId, setActiveContactId] = useState<string>("");

  useEffect(() => {
    if (initialConvId) {
      setActiveContactId(initialConvId);
    } else if (conversations.length > 0 && !activeContactId) {
      setActiveContactId(conversations[0]._id);
    }
  }, [initialConvId, conversations]);

  // Messages API for active conversation
  const userMessagesQuery = useUserConversationMessages(
    isUserMode ? activeContactId : undefined,
    token
  );
  const businessMessagesQuery = useBusinessConversationMessages(
    !isUserMode ? activeContactId : undefined,
    token
  );

  const activeMessagesQuery = isUserMode
    ? userMessagesQuery
    : businessMessagesQuery;
  const currentMessages: ApiMessage[] =
    activeMessagesQuery.data?.data?.messages || [];
  const activeConversation: ApiConversation | undefined =
    conversations.find((c) => c._id === activeContactId) ||
    activeMessagesQuery.data?.data?.conversation;

  // Reply Mutations
  const sendUserReply = useSendUserReply(token);
  const sendBusinessReply = useSendBusinessReply(token);
  const activeSendReply = isUserMode ? sendUserReply : sendBusinessReply;

  // Search & Form State
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatStreamRef = useRef<HTMLDivElement>(null);

  // Filter Conversations
  const filteredConversations = conversations.filter((c) => {
    const name = isUserMode
      ? c.businessOwnerId?.businessName ||
      `${c.businessOwnerId?.firstName || ""} ${c.businessOwnerId?.lastName || ""}` ||
      c.businessOwnerId?.username ||
      "Business"
      : `${c.userId?.firstName || ""} ${c.userId?.lastName || ""}` ||
      c.userId?.username ||
      c.userId?.email ||
      "Customer";
    const text = c.lastMessage || c.subject || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const scrollToBottom = (smooth = false) => {
    if (chatStreamRef.current) {
      chatStreamRef.current.scrollTo({
        top: chatStreamRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeContactId]);

  useEffect(() => {
    if (currentMessages.length) {
      scrollToBottom(true);
    }
  }, [currentMessages.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray].slice(0, 10));
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && selectedFiles.length === 0) || !activeContactId) {
      return;
    }

    const messageText = inputText.trim() || "Sent attachments";
    activeSendReply.mutate(
      {
        conversationId: activeContactId,
        message: messageText,
        files: selectedFiles,
      },
      {
        onSuccess: () => {
          setInputText("");
          setSelectedFiles([]);
        },
      }
    );
  };

  // Helper formatting for contacts
  const getContactInfo = (c: ApiConversation) => {
    if (isUserMode) {
      const b = c.businessOwnerId;
      const name =
        b?.businessName ||
        `${b?.firstName || ""} ${b?.lastName || ""}`.trim() ||
        b?.username ||
        "Business Owner";
      const avatar = b?.profilePicture || "/assets/images/no-image.jpg";
      const unread = c.unreadForUser || 0;
      return { name, avatar, unread };
    } else {
      const u = c.userId;
      const name =
        `${u?.firstName || ""} ${u?.lastName || ""}`.trim() ||
        u?.username ||
        u?.email ||
        "Customer";
      const avatar = u?.profilePicture || "/assets/images/no-image.jpg";
      const unread = c.unreadForBusinessOwner || 0;
      return { name, avatar, unread };
    }
  };

  const activeContactInfo = activeConversation
    ? getContactInfo(activeConversation)
    : { name: "Select a conversation", avatar: "/assets/images/no-image.jpg", unread: 0 };

  return (
    <div
      className={cn(
        "w-full bg-[#F5F7FB] p-2 md:p-4 rounded-3xl flex flex-col md:flex-row gap-4 font-sans text-slate-800 antialiased selection:bg-indigo-500 selection:text-white max-h-full overflow-hidden shrink-0",
        heightClass,
        className
      )}
    >
      {/* LEFT SIDEBAR - CHATS LIST */}
      <div
        className={cn(
          "w-full md:w-[340px] lg:w-[380px] shrink-0 bg-white rounded-2xl p-4 flex flex-col shadow-sm border border-slate-100 transition-all duration-300 h-full overflow-hidden",
          mobileShowChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header Title */}
        <div className="flex items-center justify-between mb-4 px-1 shrink-0">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Chats</h2>
          {activeConversationsQuery.isFetching && (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          )}
        </div>

        {/* Search Bar */}
        <div className="relative mb-5 shrink-0">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-xl py-2.5 pl-4 pr-10 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* All Chats Header */}
        <div className="px-1 mb-3 shrink-0 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">All Conversations</h3>
          <span className="text-xs font-semibold text-slate-400">
            {filteredConversations.length}
          </span>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {activeConversationsQuery.isPending ? (
            <div className="flex flex-col items-center justify-center h-48 space-y-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs font-medium">Loading chats...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-slate-400">
              <p className="text-sm font-semibold">No conversations found</p>
              <p className="text-xs mt-1">Start a conversation from a business profile page.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv._id === activeContactId;
              const { name, avatar, unread } = getContactInfo(conv);
              const formattedTime = conv.lastMessageAt
                ? new Date(conv.lastMessageAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "";

              return (
                <div
                  key={conv._id}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveContactId(conv._id);
                    setMobileShowChat(true);
                  }}
                  className={cn(
                    "group relative p-3 rounded-2xl cursor-pointer transition-all duration-200 flex items-center gap-3 border select-none",
                    isSelected
                      ? "bg-[#FFF0F2] border-pink-100 shadow-sm"
                      : "bg-white border-transparent hover:bg-slate-50"
                  )}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Image
                      src={avatar}
                      alt={name}
                      width={46}
                      height={46}
                      className="w-11 h-11 rounded-full object-cover shadow-sm ring-1 ring-black/5"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                        {name}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-2">
                        {formattedTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs text-slate-500 truncate">
                        {conv.lastMessage || conv.subject || "New Message"}
                      </span>

                      <div className="flex items-center gap-1 shrink-0 ml-1">
                        {unread > 0 ? (
                          <span className="w-5 h-5 bg-[#4F59F6] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                            {unread}
                          </span>
                        ) : (
                          <CheckCheck className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN PANEL - ACTIVE CHAT */}
      <div
        className={cn(
          "flex-1 bg-white rounded-2xl flex flex-col shadow-sm border border-slate-100 overflow-hidden transition-all duration-300 h-full",
          mobileShowChat ? "flex" : "hidden md:flex"
        )}
      >
        {!activeContactId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3 text-slate-300">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-700">Select a conversation</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              Choose a contact from the left list to view messages and reply.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileShowChat(false)}
                  className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <Image
                    src={activeContactInfo.avatar}
                    alt={activeContactInfo.name}
                    width={44}
                    height={44}
                    className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-black/5"
                  />
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {activeContactInfo.name}
                  </h3>
                  {activeConversation?.subject && (
                    <span className="text-xs font-medium text-indigo-600 block mt-0.5">
                      Subject: {activeConversation.subject}
                    </span>
                  )}
                </div>
              </div>

              {activeMessagesQuery.isFetching && (
                <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              )}
            </div>

            {/* Message Stream */}
            <div
              ref={chatStreamRef}
              className="flex-1 p-4 md:p-6 overflow-y-auto bg-[#FAFCFF] space-y-5 custom-scrollbar"
            >
              {activeMessagesQuery.isPending ? (
                <div className="flex flex-col items-center justify-center h-full space-y-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs font-medium">Loading messages...</span>
                </div>
              ) : currentMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                  <p className="text-sm font-semibold">No messages in this chat yet</p>
                  <p className="text-xs mt-1">Send a message below to start the conversation.</p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isUser = msg.senderId === currentUserId;
                  const formattedTime = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    : "";

                  return (
                    <div
                      key={msg._id}
                      className={cn(
                        "flex items-start gap-3 group max-w-[85%] md:max-w-[75%]",
                        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                      )}
                    >
                      {/* Avatar */}
                      <Image
                        src={
                          isUser
                            ? profileResponse?.data?.profilePicture ||
                            "/assets/images/no-image.jpg"
                            : activeContactInfo.avatar
                        }
                        alt="Avatar"
                        width={36}
                        height={36}
                        className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm mt-1 ring-1 ring-black/5"
                      />

                      {/* Message Body & Attachments */}
                      <div
                        className={cn(
                          "flex flex-col",
                          isUser ? "items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all space-y-2",
                            isUser
                              ? "bg-[#4F59F6] text-white rounded-tr-xs"
                              : "bg-white text-slate-700 border border-slate-100 rounded-tl-xs"
                          )}
                        >
                          {msg.message && <p>{msg.message}</p>}

                          {/* Attachments List */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                              {msg.attachments.map((att, attIdx) => (
                                <a
                                  key={att.public_id || attIdx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={cn(
                                    "flex items-center gap-2 p-2 rounded-xl text-xs font-semibold border transition-colors",
                                    isUser
                                      ? "bg-white/10 hover:bg-white/20 text-white border-white/20"
                                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                                  )}
                                >
                                  <Paperclip className="w-3.5 h-3.5 shrink-0" />
                                  <span className="truncate max-w-[180px]">
                                    {att.name || `Attachment ${attIdx + 1}`}
                                  </span>
                                  <Download className="w-3.5 h-3.5 shrink-0 ml-auto" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center gap-1.5 mt-1.5 px-1 text-[11px] font-medium text-slate-400">
                          {isUser ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>{formattedTime} • You</span>
                            </>
                          ) : (
                            <span>{formattedTime}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected File Previews */}
            {selectedFiles.length > 0 && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 shrink-0">
                {selectedFiles.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 shadow-xs"
                  >
                    <Paperclip className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="max-w-[140px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-red-500 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all"
              >
                <input
                  type="text"
                  placeholder="Type Your Message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={activeSendReply.isPending}
                  className="flex-1 bg-transparent border-0 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
                />

                {/* File Attachment Hidden Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Action Buttons */}
                <div className="flex items-center gap-1 text-slate-400 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
                    title="Attach File"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={
                    (!inputText.trim() && selectedFiles.length === 0) ||
                    activeSendReply.isPending
                  }
                  className="w-10 h-10 bg-[#E11D48] hover:bg-[#BE123C] disabled:opacity-50 disabled:hover:bg-[#E11D48] text-white rounded-xl flex items-center justify-center shadow-md shadow-rose-500/20 transition-all duration-200 shrink-0 cursor-pointer"
                >
                  {activeSendReply.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Send className="w-4 h-4 -mr-0.5" />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessageBox(props: MessageBoxProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center p-8 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        </div>
      }
    >
      <MessageBoxContent {...props} />
    </Suspense>
  );
}


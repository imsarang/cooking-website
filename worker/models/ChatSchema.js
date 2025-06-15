import mongoose from "mongoose";
import Message from "./MessageSchema.js";
import User from "./UserSchema.js";

const chatSchema = new mongoose.Schema({
    chatName: {
        type: String,
        required: true,
    },
    chatType: {
        type: String,
        enum: ["group", "private"],
        default: "private",
    },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        required: true,
    },

    messages: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Message",
    },

    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
}, {
    timestamps: true
})

chatSchema.pre("save", async function (next) {
    try {
        if (this.chatType === "group") {
            if (this.members.length >= 3) {
                this.chatName = this.chatName === " " ? this.members.map(member => member.username).join(",") : this.chatName;
                next();
            }
            else {
                console.log("Minimum members required for a group chat is 3");
            }
        }
        else if (this.chatType === "private") {
            if (this.members.length === 2) {
                if (!this.chatName || this.chatName === " ") {
                    this.chatName = "Private Chat";
                }
                next();
            }
        }
        else {
            console.log("Invalid chat type");
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
})

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;

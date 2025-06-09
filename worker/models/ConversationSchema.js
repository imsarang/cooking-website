import mongoose from "mongoose";
import Message from "./MessageSchema.js";
import User from "./UserSchema.js";

const conversationSchema = new mongoose.Schema({
    chatName: {
        type: String,
        required: true,
    },
    chatType: {
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
})

conversationSchema.pre("save", async function (next) {
    try {
        if (this.chatType === "group") {
            if (this.members.length >= 3) {
                this.chatName = this.chatName == " " ? this.members.map(member => member.username).join(",") : this.chatName;
                next();
            }
            else {
                console.log("Minimum members required for a group chat is 3");
            }
        }
        else if(this.chatType === "private"){
            if(this.members.length === 2){
                this.chatName = this.members.map(member => member.username).join(",");
                next();
            }   
        }
        else{
            console.log("Invalid chat type");
        }
    }
    catch (err) {
        console.log(err);
        next(err);
    }
})

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;

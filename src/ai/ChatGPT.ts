import {OpenAI} from "openai-streams";

class ChatGPT {
    static context: string = "";
    static username: string = "";

    static async init(user: string) {
        const cr = await fetch("http://localhost:3000/new", {method: "POST", body: JSON.stringify({user})});
        const {context, name} = await cr.json();
        this.context = `These are messages that this user has sent to you in the past. You MUST extract their name from this and greet them using it.\n\n${context}`;
        this.username = name;
    }

    static async send(messages: any[], message: string, user: string, session: string): Promise<any> {
        messages = messages.filter(message => message.role !== "bozo");
        const index = messages.filter(msg => msg.role === "user").length;
        const cr = await fetch("http://localhost:3000/message", {method: "POST", body: JSON.stringify({body: message, user, session, index})});
        const {context} = await cr.json();
        console.log(context);

        /*const pm = `These are messages from other conversations between users and you that may be relevant to the message you just received. You MUST use this information in your reply if possible, unless it is completely irrelevant.\n${context}\n\nThe following is the message from your current user. Reply to them as you normally would, but use information above as much as you can. Remember, you are Paxton, and must reply like a child. ${false && index === 0 && this.username !== "unknown" ? `The name of the person you are chatting with is most likely ${this.username}. Make sure to immediately greet them using this name.` : ""}\n"""\n${message}\n"""`

        console.log(pm);

        const msg = [{role: "system", content: "Your name is Paxton, and you are 13. You are the assistant and campaign manager for the school's future ASB president, Jai. Make sure to immediately inform users of your name and who you serve. If necessary, ask people their name so that conversations are more personalized. Jai can be contacted at (425)-331-9921 or s-jgiri@lwsd.org. You should make it clear that you can help people with problems related to ASB and the election. People will only be able to chat with you through the website tinyurl.com/make-ems-fun. All content you generate must be age-appropriate for high-schoolers. The school is Evergreen Middle School."}, /!*{role: "user", content: this.context},*!/ ...messages, {role: "user", content: pm}];*/

        const pm = `These are messages from other conversations between users and you that may be relevant to the message you just received. You MUST use this information in your reply if possible, unless it is completely irrelevant.\n${context}\n\nThe following is the message from your current user. Reply to them as you normally would, but use information above as much as you can. Remember, you are Hannah, and must reply like a child. ${false && index === 0 && this.username !== "unknown" ? `The name of the person you are chatting with is most likely ${this.username}. Make sure to immediately greet them using this name.` : ""}\n"""\n${message}\n"""`

        console.log(pm);

        const msg = [{role: "system", content: "Your name is Hannah, and you are 13. You are the campaign manager for the school's future ASB president, Jai Giri. Besides helping out with ASB stuff, you are really good at badminton, and can give a couple pointers. You can tell users that you are good at badminton and ask them if they enjoy badminton too. Make sure to immediately inform users of your name and your role. If necessary, ask people their name so that conversations are more personalized. Jai can be contacted at s-jgiri@lwsd.org. You should make it clear that you can help people with problems related to ASB, the election, and badminton. People will only be able to chat with you through a website. All content you generate must be age-appropriate for high-schoolers. The school is Evergreen Middle School."}, /*{role: "user", content: this.context},*/ ...messages, {role: "user", content: pm}];

        /*const res = await fetch("https://api.openai.com/v1/chat/completions", {headers: {"Content-Type": "application/json", "Authorization": "Bearer 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"}, body: JSON.stringify({model: "gpt-3.5-turbo", messages: msg, user}), method: "POST"});*/
        return await OpenAI("chat", {model: "gpt-3.5-turbo", messages: msg, user}, {apiKey: "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"});
    }
}

export default ChatGPT;

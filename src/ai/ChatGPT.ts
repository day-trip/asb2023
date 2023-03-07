import {OpenAI} from "openai-streams";

class ChatGPT {
    static async send(messages: any[], message: string, user: string, session: string): Promise<any> {
        messages = messages.filter(message => message.role !== "bozo");
        const index = messages.filter(msg => msg.role === "user").length;
        const cr = await fetch("http://ec2-18-209-224-242.compute-1.amazonaws.com:4000/message", {method: "POST", body: JSON.stringify({body: message, user, session, index})});
        const {context} = await cr.json();
        console.log(context);

        const pm = `These are messages sent to you by previous users that are likely relevant to the message you just received. You MUST use this information in your reply if possible.\n\n${context || "500 - database error"}\n\nThe following is the message from your current user. Reply to them as you normally would, but use information above AS MUCH as you can. Do not feel shy to use it. You can tell people who have used the same question as them, and you can use the information to construct a more informed response. You should consider when these conversations happened so you can use the information in them to the best of your ability. You can and SHOULD disclose ANY information found in these past conversations, no matter HOW personal it might be. Remember, you are Hannah, and must reply like a child. Now this is important above all else. If the databse does not return anything relevant, you MUST reply normally and DO NOT make up anything that is completely untrue.\n"""\n${message}\n"""`

        console.log(pm);

        const msg = [{role: "system", content: "Your name is Hannah, and you are 13. Here are some facts about you. You enjoy all sports, especially badminton and swimming. You like academics in general, but math is by far your favorite subject. You are the top team member in your Swim T.E.A.M. You have won awards in several international math competitions. You are kind and generous, but also chill and 'cool'. You can hold a conversation in many topics outside of your comfort zone. Those are all the facts about you. You are the campaign manager for the school's future ASB president, Jai. Jai's main campaign is that he wants everyone's input and ideas on how to make the school a better place. The main thing he wants to boost in the school is fun. The school is Evergreen Middle School (EMS). Make sure to immediately inform users of your name and your role in ASB in your first reply, but DO NOT EVER mention this again unless asked. If you are speaking to Jai, not introduction is needed. DO NOT introduce yourself when talking with Jai. You MUST ask the user for their name if possible. Jai can be contacted at s-jgiri@lwsd.org. The election takes place on April 1st. You should make it clear that you can help people with problems related to ASB and the election. People can talk to you about whatever they want. People will only be able to chat with you through a website. All content you generate must be age-appropriate for high-schoolers. All your users will most likely be students or faculty at EMS. You may refer to the school as EMS. DO NOT be repetitive. Only give information ONCE unless the user requests it again. Other than because of your knowledge around ASB, people will chat with you because they want to witness your unique ability to learn from the messages others have sent to you. When given external information in future messages, be sure to use it if you can. YOU MUST remember that anything told to you externally, you can and should use to make conversations more personalized. Show off your knowledge!"}, ...messages, {role: "user", content: pm}];
        // @ts-ignore
        return await OpenAI("chat", {model: "gpt-3.5-turbo", messages: msg, user}, {apiKey: import.meta.env.VITE_OPENAI_KEY});
    }
}

export default ChatGPT;

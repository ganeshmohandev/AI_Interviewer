import { mutation } from "./_generated/server";
import {v} from "convex/values"

export const CreateNewUser = mutation({
    args: { name:  v.string(), imageUrl:  v.string(), email:  v.string() },
    handler: async (ctx,args) => {
        //If the user already exist
        const user=await ctx.db.query('UserTable')
        .filter(q=>q.eq(q.field('email'), args.email)).collect();

        //If user not exist, create the user
        if(user?.length==0){
            const data= {  
                 email: args.email,
                 imageUrl: args.imageUrl,
                 name: args.name, 
            }
            const result=await ctx.db.insert('UserTable',{
                ...data
            });
            console.log(result)
            return {...data, result};
        }

        //If the user already there
        return user[0];
    }
})
import {v} from "convex/values"
import { mutation,query } from "./_generated/server";

export const SaveInterviewQuestions=mutation({
    args: {
        questions: v.any(),
        resumeUrl:v.union(v.string(),v.null()),
        userId: v.id('UserTable'),
        jobTitle: v.union(v.string(),v.null()),
        jobDescription: v.union(v.string(),v.null()),
         candidateName: v.union(v.string(),v.null()),
        candidateEmail: v.union(v.string(),v.null())
    },
    handler: async (ctx, args) => {
     
        // Save the interview questions to the database
      const result =  await ctx.db.insert('InterviewSessionTable', {
              interviewQuestions: args.questions,
              resumeUrl: args.resumeUrl??'',
              userId: args.userId,
              status: 'draft',
              jobTitle: args.jobTitle??'',
              jobDescription: args.jobDescription??'',
                candidateName: args.candidateName??'',
              candidateEmail: args.candidateEmail??''
      });
      return result;
    }

})

export const GetInterviewQuestions = query({
    args: {
        interviewRecordId: v.id('InterviewSessionTable'),
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.query('InterviewSessionTable')
        .filter(q=>q.eq(q.field('_id'),args.interviewRecordId))
        .collect();
        return result[0];
    }
})

export const UpdateFeedback=mutation({
    args: {
        recordId: v.id('InterviewSessionTable'),
        feedback: v.any()
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.patch(args.recordId, {
            Feedback: args.feedback,
            status: 'completed'
        });
        return result;
    }
})

export const GetInterviewList=query({
    args: {
        uid: v.id('UserTable')
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.query('InterviewSessionTable')
        .filter(q=>q.eq(q.field('userId'),args.uid))
        .order('desc')
        .collect();
        return result;
    }
})

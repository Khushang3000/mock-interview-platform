import { db } from "@/firebase/admin";

export async function getInterviewsByUserId(userId: string): Promise<Interview[] | null>{//so basically this function will return a promise which will resolve into Interview[] array of interviews or null if nothing exists.
    const interviews = await db.collection('interviews')
                            .where('userId','==',userId)
                            .orderBy('createdAt', 'desc')
                            .get()//order them in a descending order.
    return interviews.docs.map((doc)=>({
        //directly returning an object.
        id: doc.id,
        ...doc.data()//and spreading out the rest of the doc data.

    })) as Interview[];//now let's go to page.tsx and instead of getting the dummy interviews, let's get the real ones.(home page.)
}

export async function getLatestInterviews(params: GetLatestInterviewsParams): Promise<Interview[] | null>{
    
    //getting the userId through params and also setting the limit as 20 by default if it wasn't provided in params.
    const {userId, limit=20} = params;
    
    const interviews = await db.collection('interviews')
                            .orderBy('createdAt', 'desc')//ordering by createdAt
                            .where('finalized', '==', true)//getting only the interviews that are finalized
                            .where('userId','!=',userId)//getting interviews of other users rather than this one.
                            .limit(limit)//also limit the amount of interviews that we should get.
                            .get();//get.
    //rest all returns the same. now go back to the home page, fetching part.
    

    return interviews.docs.map((doc)=>({
        //directly returning an object.
        id: doc.id,
        ...doc.data()//and spreading out the rest of the doc data.

    })) as Interview[];//now let's go to page.tsx and instead of getting the dummy interviews, let's get the real ones.(home page.)
}

//function to get interview by it's own id.
export async function getInterviewById(id: string): Promise<Interview | null>{//takes an id of the interview, and returns a promise that resolves into an Interview(not array of Interview)
    const interview = await db.collection('interviews').doc(id).get();
                            
    return interview.data() as Interview | null;
}//now go to the dynamic page you made and fetch it.
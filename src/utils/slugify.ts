import slugify from "slugify"


export const createUsername = (text: string): string => {
    if (!text) return "";
    
    return slugify(text, {
                        replacement: '', 
                        lower: true,
                        strict: true,
                        trim: true
                    });                     
};
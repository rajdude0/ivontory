
import crypto from "crypto";

export const groupBy = (key, array = [], merge=true) => {
    return array.reduce((acc, curr, i) => {
            const keyValue = curr[key];
            if(merge) {
                if(acc.hasOwnProperty(keyValue)) {
                    acc[keyValue].push(curr);
                } else {
                    acc[keyValue] = [curr];
                }
            
            } else {
               acc = {...acc, [keyValue]: curr }
            }
            return acc;
    }, {})
}

export const md5 = (data) => crypto.createHash("md5").update(data, 'utf-8').digest('hex');
export function stringToColor(string: string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string?.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

export function stringAvatar(name: string) {
    if (name === null || name === undefined) {
        return null;
    }

    return `${name[0]}`;
}

function checkPasswordStrength(password: string | null) {
    if (!password) return;
    // Define your criteria for password strength
    const minLength = 8; // Minimum password length
    const minUpperCase = 1; // Minimum uppercase characters
    const minLowerCase = 1; // Minimum lowercase characters
    const minDigits = 1; // Minimum digits
    const minSpecialChars = 1; // Minimum special characters
    let score = 0;
    const messages = [];

    // Perform the password strength check
    if (password.length < minLength) {
        messages.push('Password is too short.');
    } else {
        score += 1;
    }

    // You can use regular expressions to match the criteria
    if (!/(?=.*[A-Z])/.test(password) || password.length < minUpperCase) {
        messages.push('Password should contain at least one uppercase character.');
    } else {
        score += 1;
    }

    if (!/(?=.*[a-z])/.test(password) || password.length < minLowerCase) {
        messages.push('Password should contain at least one lowercase character.');
    } else {
        score += 1;
    }

    if (!/(?=.*\d)/.test(password) || password.length < minDigits) {
        messages.push('Password should contain at least one digit.');
    } else {
        score += 1;
    }

    if (!/(?=.*[@#$%^&+=])/.test(password) || password.length < minSpecialChars) {
        messages.push('Password should contain at least one special character.');
    } else {
        score += 1;
    }

    // If all criteria pass, the password is considered strong
    return {
        score,
        messages,
    };
}

export function pad(num: number | string, size: number) {
    let stringNum = num.toString();
    while (stringNum.length < size) stringNum = '0' + stringNum;
    return stringNum;
}

//convert base64 to file
export const dataURLtoFile = (dataUrl: any, filename: string) => {
    var arr = dataUrl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[arr.length - 1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

// import { MediaAPIResponse, UploadMediaResponse } from '@/types';
// import { UploadFile } from 'antd';

// type UploadValue = UploadFile<MediaAPIResponse> | UploadMediaResponse;

// export const uploadTransformer = (media: UploadValue | UploadValue[]) => {
//     if (Array.isArray(media)) {
//         return media.map((file) => {
//             if ('response' in file) {
//                 return file.response.mediaId;
//             }
//             return file.uid;
//         });
//     }

//     if ('response' in media) {
//         return media.response.mediaId;
//     }

//     return media.uid;
// };

import AWS from 'aws-sdk';


export default class S3 {

    private static instance: S3;
    private s3: AWS.S3;
    private constructor() {
        this.s3 = new AWS.S3();
    }
    public static getInstance(): S3 {
        if (!S3.instance) {
            S3.instance = new S3();
        }
        return S3.instance;
    }
}
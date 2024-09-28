import { Schema } from "mongoose";
export default interface IAddress {
    _id?: Schema.Types.ObjectId;
    street: string;
    city: string;
    country: string;
}

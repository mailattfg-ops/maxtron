
import { CompanyModel } from './src/modules/maxtron/models/companyModel';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    const companies = await CompanyModel.getAll();
    console.log(JSON.stringify(companies, null, 2));
}

check();

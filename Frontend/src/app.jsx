import React from 'react'
import { useForm } from 'react-hook-form'
import axios from "axios";

const steps = [
  { title: 'Demographics' },
  { title: 'Household & Residence' },
  { title: 'Employment & Income' },
  { title: 'Credit Profile' },
  { title: 'Banking & Loan' },
  { title: 'Digital & Telecom' },
  { title: 'Spending & Payments' },
  { title: 'Security & Terms' },
]

// fields per step (for targeted validation)
const STEP_FIELDS = [
  ['Age','Gender','Marital_Status','Education_Level'],
  ['Household_Size','Dependents','Home_Ownership','Residence_Type'],
  ['Employment_Status','Occupation','Annual_Income','EMI','Debt_to_Income_Ratio','Total_Debt'],
  ['Credit_History_Length','Number_of_Credit_Cards','Number_of_Loans','Credit_Card_Utilization_Rate','Credit_Inquiries_Last12m','OnTime_Payment_Rate'],
  ['Bank_Balance','Savings_Balance','Loan_Amount_Requested','Repayment_Period_Months'],
  ['Mobile_Data_Usage_GB','Monthly_Call_Minutes','Monthly_SMS_Count','No_of_Social_Accounts','Avg_Daily_Social_Usage_Min','Facebook_Friends_Count','Instagram_Followers_Count'],
  ['Monthly_Ecommerce_Spend','Subscription_Service_Count','Installment_Purchase_Count','Avg_UPI_Transactions','UPI_Count','Avg_Monthly_UPI_Transaction_Value','Utility_Bill_Payment_Timeliness'],
  ['SIM_Swap_History','No_of_Devices_Linked','creditCheck','eConsent','acceptTerms'],
]

const ORDER = [
  "Age","Gender","Marital_Status","Education_Level",
  "Employment_Status","Occupation","Annual_Income","Household_Size",
  "Dependents","Home_Ownership","Residence_Type","Credit_History_Length",
  "Number_of_Credit_Cards","Number_of_Loans","Debt_to_Income_Ratio",
  "Total_Debt","EMI","Loan_Amount_Requested","Repayment_Period_Months",
  "Credit_Card_Utilization_Rate","Bank_Balance","Savings_Balance",
  "Credit_Inquiries_Last12m","OnTime_Payment_Rate","Mobile_Data_Usage_GB",
  "Monthly_Call_Minutes","Monthly_SMS_Count","No_of_Social_Accounts",
  "Avg_Daily_Social_Usage_Min","Facebook_Friends_Count",
  "Instagram_Followers_Count","Monthly_Ecommerce_Spend",
  "Subscription_Service_Count","Installment_Purchase_Count",
  "Avg_UPI_Transactions","UPI_Count","Avg_Monthly_UPI_Transaction_Value",
  "Utility_Bill_Payment_Timeliness","SIM_Swap_History","No_of_Devices_Linked"
];

export default function App(){
  const [step, setStep] = React.useState(0)
  const { register, handleSubmit, formState: { errors }, trigger } = useForm({ mode: 'onTouched' })

  const Err = ({name}) => errors?.[name] ? <div className="error">{errors[name].message}</div> : null
  const req = (msg='This field is required.') => ({ required: msg })

  async function next(){
    const valid = await trigger(STEP_FIELDS[step])
    if (valid && step < steps.length - 1) setStep(step+1)
  }
  function back(){ setStep(Math.max(0, step-1)) }
  function onSubmit1(data){
    alert('Application submitted! (Open devtools console to view payload.)')
    console.log('SUBMISSION:', data)
  }

const encode = (data) => {
  const out = { ...data };

  // 1. Age: clip to 21–69
  if (out.Age !== null && out.Age !== undefined) {
    out.Age = Math.max(21, Math.min(69, Number(out.Age)));
  }

  // 2. Gender: map string → numeric
  // Python: 0=male, 1=female
  if (out.Gender) {
    const g = out.Gender.toLowerCase();
    if (g === "male") out.Gender = 0;
    else if (g === "female") out.Gender = 1;
    else out.Gender = null; // Non-binary / Prefer not to say
  }

  // 3. Marital_Status: map string → numeric
  // Python: 0=married, 1=unmarried, 2=divorced, 3=widow
  if (out.Marital_Status) {
    const m = out.Marital_Status.toLowerCase();
    if (m === "married") out.Marital_Status = 0;
    else if (m === "single" || m === "other") out.Marital_Status = 1;
    else if (m === "divorced") out.Marital_Status = 2;
    else if (m === "widowed") out.Marital_Status = 3;
    else out.Marital_Status = null;
  }

  // 4. Dependents
  out.Dependents = Number(out.Dependents ?? 0);

  // 5. Household_Size
  out.Household_Size = Number(out.Household_Size ?? 1);

  // 6. Education_Level: map string → numeric
  // Python: 0=junior HS, 1=senior HS, 2=bachelor+
  if (out.Education_Level) {
    const e = out.Education_Level.toLowerCase();
    if (e.includes("high school") || e.includes("junior")) out.Education_Level = 0;
    else if (e.includes("diploma") || e.includes("senior")) out.Education_Level = 1;
    else if (
      e.includes("bachelor") ||
      e.includes("master") ||
      e.includes("doctor") ||
      e.includes("other")
    ) {
      out.Education_Level = 2;
    } else out.Education_Level = null;
  }

  // 7. Home_Ownership: map string → numeric
  // Python: 0=own, 1=parent, 2=rent
  if (out.Home_Ownership) {
    const h = out.Home_Ownership.toLowerCase();
    if (h === "own" ) out.Home_Ownership = 0;
    else if (h === "family" || h.includes("parent")) out.Home_Ownership = 1;
    else if (h === "rent" || h.includes("Company")) out.Home_Ownership = 2;
    else out.Home_Ownership = null; // company/other → null
  }

  // 8. Employment_Status: map string → probability score
  if (out.Employment_Status) {
    const e = out.Employment_Status.toLowerCase();
    if (e === "employed") out.Employment_Status = 0.72;
    else if (e === "self-employed") out.Employment_Status = 0.54;
    else if (e === "unemployed") out.Employment_Status = 0.21;
    else if (e === "retired") out.Employment_Status = 0.35;
    else if (e === "student") out.Employment_Status = 0.28;
    else out.Employment_Status = null;
  }

  // 9. Occupation: map string → probability score
  if (out.Occupation) {
    const o = out.Occupation.toLowerCase();
    if (o.includes("engineer") || o.includes("tech")) out.Occupation = 0.67;
    else if (o.includes("teacher") || o.includes("education")) out.Occupation = 0.45;
    else if (o.includes("manager") || o.includes("executive")) out.Occupation = 0.62;
    else if (o.includes("technician") || o.includes("skilled")) out.Occupation = 0.41;
    else if (o.includes("sales") || o.includes("service")) out.Occupation = 0.38;
    else if (o.includes("health") || o.includes("medical")) out.Occupation = 0.59;
    else if (o.includes("labor") || o.includes("unskilled")) out.Occupation = 0.25;
    else out.Occupation = null;
  }

  // 10. Residence_Type: map string → probability score
  if (out.Residence_Type) {
    const r = out.Residence_Type.toLowerCase();
    if (r.includes("own")) out.Residence_Type = 0.69;
    else if (r.includes("rent")) out.Residence_Type = 0.54;
    else if (r.includes("mortgage")) out.Residence_Type = 0.61;
    else if (r.includes("family") || r.includes("parent")) out.Residence_Type = 0.47;
    else out.Residence_Type = 0.33; // default "other / temporary"
  }

  return out;
};



  const onSubmit = async(form) => {
  // exact key order, values as entered
  const ordered = Object.fromEntries(ORDER.map(k => [k, form[k] ?? null]));

  //console.log('PAYLOAD_ORDERED', ordered); // final JSON in required order
  alert('Application submitted! Open the console to see the results.');

  const final = encode(ordered);

  //console.log(final);

    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const response = await axios.post('http://127.0.0.1:5000/predictpod', final, axiosConfig);

    console.log(response.data.PoD.flat());

  // Example POST
  // fetch('/api/applications', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(ordered)
  // })
}

  return (
    <div className="container">
      
      <div className="card">
        <h1 align='center'>Credit Score and Defaulter Prediction</h1>
        <p className="subtitle">Please complete all required fields. We’ll only use your information to process this application.</p>

        {/* Stepper */}
        <div className="stepper" aria-label="Progress">
          {steps.map((s, i)=>(
            <React.Fragment key={s.title}>
              <div className={'dot ' + (i===step ? 'active' : i<step ? 'done' : '')} title={s.title}>{i+1}</div>
              {i<steps.length-1 && <div className="bar" />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* STEP 1 */}
          {step===0 && (
            <section>
              <h2>Demographics</h2>
              <div className="row">
                <div className="col col-3">
                  <label htmlFor="Age">Age *</label>
                  <input id="Age" type="number" placeholder="18+"
                    className={errors.Age?'error':''}
                    {...register('Age',{...req(), valueAsNumber:true, min:{value:18,message:'Must be at least 18'}, max:{value:120,message:'Enter a valid age'}})} />
                  <Err name="Age" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Gender">Gender *</label>
                  <select id="Gender" className={errors.Gender?'error':''} {...register('Gender', req())}>
                    <option value="">Select...</option>
                    <option>Male</option><option>Female</option>
                  </select>
                  <Err name="Gender" />
                </div>
                <div className="col col-5">
                  <label htmlFor="Marital_Status">Marital Status *</label>
                  <select id="Marital_Status" className={errors.Marital_Status?'error':''} {...register('Marital_Status', req())}>
                    <option value="">Select...</option>
                    <option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option><option>Other</option>
                  </select>
                  <Err name="Marital_Status" />
                </div>
                <div className="col col-12">
                  <label htmlFor="Education_Level">Education Level *</label>
                  <select id="Education_Level" className={errors.Education_Level?'error':''} {...register('Education_Level', req())}>
                    <option value="">Select...</option>
                    <option>High School</option><option>Diploma</option><option>Bachelor's</option><option>Master's</option><option>Doctorate</option><option>Other</option>
                  </select>
                  <Err name="Education_Level" />
                </div>
              </div>
            </section>
          )}

          {/* STEP 2 */}
          {step===1 && (
            <section>
              <h2>Household & Residence</h2>
              <div className="row">
                <div className="col col-3">
                  <label htmlFor="Household_Size">Household Size *</label>
                  <input id="Household_Size" type="number" className={errors.Household_Size?'error':''}
                    {...register('Household_Size',{...req(), valueAsNumber:true, min:{value:1,message:'Min 1'}})} />
                  <Err name="Household_Size" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Dependents">Dependents *</label>
                  <input id="Dependents" type="number" className={errors.Dependents?'error':''}
                    {...register('Dependents',{...req(), valueAsNumber:true, min:{value:0,message:'Cannot be negative'}})} />
                  <Err name="Dependents" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Home_Ownership">Home Ownership *</label>
                  <select id="Home_Ownership" className={errors.Home_Ownership?'error':''} {...register('Home_Ownership', req())}>
                    <option value="">Select...</option>
                    <option>Own</option><option>Rent</option><option>Family</option><option>Company-provided</option><option>Other</option>
                  </select>
                  <Err name="Home_Ownership" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Residence_Type">Residence Type *</label>
                  <select id="Residence_Type" className={errors.Residence_Type?'error':''} {...register('Residence_Type', req())}>
                        <option value="">Select...</option>
                        <option value="Owned">Owned</option>
                        <option value="Rented">Rented</option>
                        <option value="Mortgaged">Mortgaged</option>
                        <option value="Family / With Parents">Family / With Parents</option>
                        <option value="Other">Other (temporary / hostel etc.)</option>
                    </select>
                  <Err name="Residence_Type" />
                </div>
              </div>
            </section>
          )}

          {/* STEP 3 */}
          {step===2 && (
            <section>
              <h2>Employment & Income</h2>
              <div className="row">
                <div className="col col-4">
                  <label htmlFor="Employment_Status">Employment Status *</label>
                  <select id="Employment_Status" className={errors.Employment_Status?'error':''} {...register('Employment_Status', req())}>
                    <option value="">Select...</option>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Unemployed">Unemployed</option>
                    <option value="Retired">Retired</option>
                    <option value="Student">Student</option>
                  </select>
                  <Err name="Employment_Status" />
                </div>
                <div className="col col-8">
                  <label htmlFor="Occupation">Occupation *</label>
                  <select id="Occupation" placeholder="e.g., Software Engineer" className={errors.Occupation?'error':''}
                    {...register('Occupation', req())} >
                    <option value="">Select...</option>
                    <option value="Engineer / Technical">Engineer / Technical</option>
                    <option value="Teacher / Education">Teacher / Education</option>
                    <option value="Manager / Executive">Manager / Executive</option>
                    <option value="Technician / Skilled Trade">Technician / Skilled Trade</option>
                    <option value="Sales / Service">Sales / Service</option>
                    <option value="Healthcare / Medical">Healthcare / Medical</option>
                    <option value="Unskilled / Labor">Unskilled / Labor</option>
                  </select>
                  <Err name="Occupation" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Annual_Income">Annual Income (pre-tax) *</label>
                  <input id="Annual_Income" type="number" placeholder="0.00" className={errors.Annual_Income?'error':''}
                    {...register('Annual_Income',{...req(), valueAsNumber:true, min:{value:0,message:'Must be ≥ 0'}})} />
                  <Err name="Annual_Income" />
                </div>
                <div className="col col-4">
                  <label htmlFor="EMI">Monthly EMI *</label>
                  <input id="EMI" type="number" placeholder="0.00" className={errors.EMI?'error':''}
                    {...register('EMI',{...req(), valueAsNumber:true, min:{value:0,message:'Must be ≥ 0'}})} />
                  <Err name="EMI" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Debt_to_Income_Ratio">Debt to Income Ratio (%) *</label>
                  <input id="Debt_to_Income_Ratio" type="number" placeholder="0–100" className={errors.Debt_to_Income_Ratio?'error':''}
                    {...register('Debt_to_Income_Ratio',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}, max:{value:100,message:'≤ 100'}})} />
                  <Err name="Debt_to_Income_Ratio" />
                </div>
                <div className="col col-6">
                  <label htmlFor="Total_Debt">Total Debt *</label>
                  <input id="Total_Debt" type="number" placeholder="0.00" className={errors.Total_Debt?'error':''}
                    {...register('Total_Debt',{...req(), valueAsNumber:true, min:{value:0,message:'Must be ≥ 0'}})} />
                  <Err name="Total_Debt" />
                </div>
              </div>
            </section>
          )}

          {/* STEP 4 */}
          {step===3 && (
            <section>
              <h2>Credit Profile</h2>
              <div className="row">
                <div className="col col-4">
                  <label htmlFor="Credit_History_Length">Credit History Length (years) *</label>
                  <input id="Credit_History_Length" type="number" step="0.1" className={errors.Credit_History_Length?'error':''}
                    {...register('Credit_History_Length',{...req(), valueAsNumber:true, min:{value:0,message:'Must be ≥ 0'}})} />
                  <Err name="Credit_History_Length" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Number_of_Credit_Cards">Number of Credit Cards *</label>
                  <input id="Number_of_Credit_Cards" type="number" step="1" className={errors.Number_of_Credit_Cards?'error':''}
                    {...register('Number_of_Credit_Cards',{...req(), valueAsNumber:true, min:{value:0,message:'Must be ≥ 0'}})} />
                  <Err name="Number_of_Credit_Cards" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Number_of_Loans">Number of Loans *</label>
                  <input id="Number_of_Loans" type="number" step="1" className={errors.Number_of_Loans?'error':''}
                    {...register('Number_of_Loans',{...req(), valueAsNumber:true, min:{value:0,message:'Must be ≥ 0'}})} />
                  <Err name="Number_of_Loans" />
                </div>

                <div className="col col-4">
                  <label htmlFor="Credit_Card_Utilization_Rate">Credit Card Utilization Rate (%) *</label>
                  <input id="Credit_Card_Utilization_Rate" type="number" placeholder="0–100" className={errors.Credit_Card_Utilization_Rate?'error':''}
                    {...register('Credit_Card_Utilization_Rate',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}, max:{value:100,message:'≤ 100'}})} />
                  <Err name="Credit_Card_Utilization_Rate" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Credit_Inquiries_Last12m">Credit Inquiries (last 12m) *</label>
                  <input id="Credit_Inquiries_Last12m" type="number" step="1" className={errors.Credit_Inquiries_Last12m?'error':''}
                    {...register('Credit_Inquiries_Last12m',{...req(), valueAsNumber:true, min:{value:0,message:'Must be ≥ 0'}})} />
                  <Err name="Credit_Inquiries_Last12m" />
                </div>
                <div className="col col-4">
                  <label htmlFor="OnTime_Payment_Rate">On-Time Payment Rate (%) *</label>
                  <input id="OnTime_Payment_Rate" type="number" placeholder="0–100" className={errors.OnTime_Payment_Rate?'error':''}
                    {...register('OnTime_Payment_Rate',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}, max:{value:100,message:'≤ 100'}})} />
                  <Err name="OnTime_Payment_Rate" />
                </div>
              </div>
            </section>
          )}

          {/* STEP 5 */}
          {step===4 && (
            <section>
              <h2>Banking & Loan</h2>
              <div className="row">
                <div className="col col-3">
                  <label htmlFor="Bank_Balance">Bank Balance *</label>
                  <input id="Bank_Balance" type="number" className={errors.Bank_Balance?'error':''}
                    {...register('Bank_Balance',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Bank_Balance" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Savings_Balance">Savings Balance *</label>
                  <input id="Savings_Balance" type="number" className={errors.Savings_Balance?'error':''}
                    {...register('Savings_Balance',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Savings_Balance" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Loan_Amount_Requested">Loan Amount Requested *</label>
                  <input id="Loan_Amount_Requested" type="number" className={errors.Loan_Amount_Requested?'error':''}
                    {...register('Loan_Amount_Requested',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Loan_Amount_Requested" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Repayment_Period_Months">Repayment Period (months) *</label>
                  <input id="Repayment_Period_Months" type="number" step="1" className={errors.Repayment_Period_Months?'error':''}
                    {...register('Repayment_Period_Months',{...req(), valueAsNumber:true, min:{value:1,message:'Min 1 month'}})} />
                  <Err name="Repayment_Period_Months" />
                </div>
              </div>
            </section>
          )}

          {/* STEP 6 */}
          {step===5 && (
            <section>
              <h2>Digital & Telecom</h2>
              <div className="row">
                <div className="col col-3">
                  <label htmlFor="Mobile_Data_Usage_GB">Mobile Data Usage (GB/month) *</label>
                  <input id="Mobile_Data_Usage_GB" type="number" step="0.01" className={errors.Mobile_Data_Usage_GB?'error':''}
                    {...register('Mobile_Data_Usage_GB',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Mobile_Data_Usage_GB" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Monthly_Call_Minutes">Monthly Call Minutes *</label>
                  <input id="Monthly_Call_Minutes" type="number" step="1" className={errors.Monthly_Call_Minutes?'error':''}
                    {...register('Monthly_Call_Minutes',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Monthly_Call_Minutes" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Monthly_SMS_Count">Monthly SMS Count *</label>
                  <input id="Monthly_SMS_Count" type="number" step="1" className={errors.Monthly_SMS_Count?'error':''}
                    {...register('Monthly_SMS_Count',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Monthly_SMS_Count" />
                </div>
                <div className="col col-3">
                  <label htmlFor="No_of_Social_Accounts">No. of Social Accounts *</label>
                  <input id="No_of_Social_Accounts" type="number" step="1" className={errors.No_of_Social_Accounts?'error':''}
                    {...register('No_of_Social_Accounts',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="No_of_Social_Accounts" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Avg_Daily_Social_Usage_Min">Avg Daily Social Usage (min) *</label>
                  <input id="Avg_Daily_Social_Usage_Min" type="number" step="1" className={errors.Avg_Daily_Social_Usage_Min?'error':''}
                    {...register('Avg_Daily_Social_Usage_Min',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Avg_Daily_Social_Usage_Min" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Facebook_Friends_Count">Facebook Friends Count *</label>
                  <input id="Facebook_Friends_Count" type="number" step="1" className={errors.Facebook_Friends_Count?'error':''}
                    {...register('Facebook_Friends_Count',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Facebook_Friends_Count" />
                </div>
                <div className="col col-4">
                  <label htmlFor="Instagram_Followers_Count">Instagram Followers Count *</label>
                  <input id="Instagram_Followers_Count" type="number" step="1" className={errors.Instagram_Followers_Count?'error':''}
                    {...register('Instagram_Followers_Count',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Instagram_Followers_Count" />
                </div>
              </div>
            </section>
          )}

          {/* STEP 7 */}
          {step===6 && (
            <section>
              <h2>Spending & Payments</h2>
              <div className="row">
                <div className="col col-3">
                  <label htmlFor="Monthly_Ecommerce_Spend">Monthly eCommerce Spend *</label>
                  <input id="Monthly_Ecommerce_Spend" type="number" step="0.01" className={errors.Monthly_Ecommerce_Spend?'error':''}
                    {...register('Monthly_Ecommerce_Spend',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Monthly_Ecommerce_Spend" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Subscription_Service_Count">Subscription Service Count *</label>
                  <input id="Subscription_Service_Count" type="number" step="1" className={errors.Subscription_Service_Count?'error':''}
                    {...register('Subscription_Service_Count',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Subscription_Service_Count" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Installment_Purchase_Count">Installment Purchase Count *</label>
                  <input id="Installment_Purchase_Count" type="number" step="1" className={errors.Installment_Purchase_Count?'error':''}
                    {...register('Installment_Purchase_Count',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Installment_Purchase_Count" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Utility_Bill_Payment_Timeliness">Utility Bill Payment Timeliness % *</label>
                  <input id="Utility_Bill_Payment_Timeliness" type="number" placeholder="0–100" className={errors.Utility_Bill_Payment_Timeliness?'error':''}
                    {...register('Utility_Bill_Payment_Timeliness', {...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}, max:{value:100,message:'≤ 100'}})}>
                  </input>
                  <Err name="Utility_Bill_Payment_Timeliness" />
                </div>

                <div className="col col-3">
                  <label htmlFor="Avg_UPI_Transactions">Avg UPI Transactions (per month) *</label>
                  <input id="Avg_UPI_Transactions" type="number" step="1" className={errors.Avg_UPI_Transactions?'error':''}
                    {...register('Avg_UPI_Transactions',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Avg_UPI_Transactions" />
                </div>
                <div className="col col-3">
                  <label htmlFor="UPI_Count">UPI Count (monthly) *</label>
                  <input id="UPI_Count" type="number" step="1" className={errors.UPI_Count?'error':''}
                    {...register('UPI_Count',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="UPI_Count" />
                </div>
                <div className="col col-3">
                  <label htmlFor="Avg_Monthly_UPI_Transaction_Value">Avg Monthly UPI Txn Value *</label>
                  <input id="Avg_Monthly_UPI_Transaction_Value" type="number" step="0.01" className={errors.Avg_Monthly_UPI_Transaction_Value?'error':''}
                    {...register('Avg_Monthly_UPI_Transaction_Value',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="Avg_Monthly_UPI_Transaction_Value" />
                </div>
              </div>
            </section>
          )}

          {/* STEP 8 */}
          {step===7 && (
            <section>
              <h2>Security & Terms</h2>
              <div className="row">
                <div className="col col-6">
                  <label htmlFor="SIM_Swap_History">SIM Swap History *</label>
                  <input id="SIM_Swap_History" type = "number" className={errors.SIM_Swap_History?'error':''} {...register('SIM_Swap_History', {...req(), valueAsNumber:true, min:{value:0,message:'Must be ≥ 0'}})}>
                  </input>
                  <Err name="SIM_Swap_History" />
                </div>
                <div className="col col-6">
                  <label htmlFor="No_of_Devices_Linked">No. of Devices Linked *</label>
                  <input id="No_of_Devices_Linked" type="number" step="1" className={errors.No_of_Devices_Linked?'error':''}
                    {...register('No_of_Devices_Linked',{...req(), valueAsNumber:true, min:{value:0,message:'≥ 0'}})} />
                  <Err name="No_of_Devices_Linked" />
                </div>
              </div>

              <h2>Terms & Disclosures</h2>
              <div className="row">
                <div className="col col-12">
                  <label><input type="checkbox" {...register('creditCheck', req('Please authorize the credit check.'))} /> I authorize a hard credit inquiry to evaluate my application.</label>
                  <Err name="creditCheck" />
                </div>
                <div className="col col-12">
                  <label><input type="checkbox" {...register('eConsent', req('Please consent to electronic disclosures.'))} /> I consent to receive disclosures electronically.</label>
                  <Err name="eConsent" />
                </div>
                <div className="col col-12">
                  <label><input type="checkbox" {...register('acceptTerms', req('Please confirm the information is accurate.'))} /> I confirm that all information provided is accurate.</label>
                  <Err name="acceptTerms" />
                </div>
              </div>
            </section>
          )}

          {/* Actions */}
          <div className="actions">
            <button type="button" className="btn btn-outline" onClick={back} disabled={step===0}>Back</button>
            {step < steps.length-1
              ? <button type="button" className="btn" onClick={next}>Next</button>
              : <button type="submit" className="btn-success">Submit Application</button>
            }
          </div>
        </form>
      </div>
    </div>
  )
}
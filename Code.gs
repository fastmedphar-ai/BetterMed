/**
 * BetterMed — personal question bank + analytics (Google Apps Script web app)
 * Bound to a Google Sheet. Sheets: Questions, Results, Sessions, Media, Settings.
 */
const APP_NAME = 'BetterMed';
const SH = {
  Q: ['Questions', ['ID', 'Subject', 'Topic', 'Question', 'A', 'B', 'C', 'D', 'E', 'Answer', 'Rationale', 'Tags', 'AnkiGUID', 'Updated', 'TOSArea', 'Deck']],
  R: ['Results',   ['Timestamp', 'SessionID', 'QuestionID', 'Subject', 'Chosen', 'Answer', 'Correct', 'Seconds']],
  S: ['Sessions',  ['SessionID', 'Started', 'Finished', 'Mode', 'Subjects', 'Total', 'Correct', 'ScorePct']],
  M: ['Media',     ['Filename', 'FileId', 'MimeType', 'SizeKB']],
  C: ['Settings',  ['Key', 'Value']],
  A: ['AI',        ['QuestionID', 'Explanation', 'Updated']],
};

/* ---------- PLE subjects (PRC order since the March 2026 PLE) ---------- */
const PLE = [
  ['Physiology', 1, '8:00 AM'], ['Legal Medicine', 1, '11:00 AM'], ['Pathology', 1, '2:00 PM'],
  ['Biochemistry', 2, '8:00 AM'], ['Anatomy and Histology', 2, '11:00 AM'], ['Microbiology and Parasitology', 2, '2:00 PM'],
  ['Obstetrics and Gynecology', 3, '8:00 AM'], ['Pediatrics and Nutrition', 3, '11:00 AM'], ['Preventive Medicine', 3, '2:00 PM'],
  ['Pharmacology and Therapeutics', 4, '8:00 AM'], ['Surgery', 4, '11:00 AM'], ['Medicine', 4, '2:00 PM'],
];
const PLE_RULES_ = [
  [/legal|jurisprud|ethic|forensic/, 'Legal Medicine'],
  [/prevent|community|public health|epidemiol|biostat/, 'Preventive Medicine'],
  [/pharma/, 'Pharmacology and Therapeutics'],
  [/patho| path /, 'Pathology'],
  [/micro|parasit|immunol/, 'Microbiology and Parasitology'],
  [/biochem/, 'Biochemistry'],
  [/physio/, 'Physiology'],
  [/anat|histo|embryo/, 'Anatomy and Histology'],
  [/pedia|paedia| peds |nutrition/, 'Pediatrics and Nutrition'],
  [/obstet|gyne| gyn | ob |obgyn/, 'Obstetrics and Gynecology'],
  [/surg/, 'Surgery'],
  [/internal|medicine| im /, 'Medicine'],
];
/* ---------- PLE Table of Specifications ----------
   Board of Medicine Resolution No. 19 s. 2025 (Enhanced TOS, Annex A), used from the October 2025 PLE.
   Each subject: k = code prefix, bloom = item counts [Remember, Understand, Apply, Analyze, Evaluate, Create]
   (null where the scanned total could not be read), areas = [name, items out of 100, content].        */
const TOS = {"Anatomy and Histology": {"k": "ANA","bloom": [20,10,30,20,20,0],"areas": [["Thorax",10,"Thoracic Wall (Fascia, Joints, Movements) Breasts, Cavity and Viscera, Heart Great Vessels and Pleura"],["Abdomen",10,"Abdominal Cavity; Abdominal Wall Muscles, Nerves, Vessels, Region); Peritoneum and Cavity; Abdominal Viscera Stomach/Duodenum, Intestine; Rectum, Anus, Pancreas, Liver, Biliary Ducts, bladder, Kidneys, Ureters, (Adrenal) glands); Diaphragm (vessels, Nerves, Po"],["Pelvis and Perineum",10,"and Perineum Pelvis (Joints, Ligaments, Walls, Floor, Nerves, Vessels) Viscera of Pelvic Cavity (Urinary Organs, male Internal Genital Organ, Female Internal Genital Organs, Pelvic Fascia) Perineum (Perineal fascia, Superficial/Deep Perineal Pouch, Pelvic Diap"],["Back and Spinal Column",10,"and Spinal Column Vertebral Column (Structure, Function, Curvature, Joints, Ossification, Regimal Characteristics) Muscles of the Back (Superficia/Deep back muscles, suboccipttal and Deep Neck Muscles) Spinal Cord and Meninges: Structure of Spinal Nerves, Spin"],["Lower Limb",10,"Limb Bones of the Lower Limb (Hip bone, Femur, Tibia and Fibula and Bones of the Fool) Fascia, Vessels, Nerves (Venous drainage, lymphatic drainage, Cutaneous Innervation) Anterior and Medial Thigh Muscles Gluteal Region (Ligaments, Muscles, Nerves, Arteries, "],["Upper Limb",10,"Limb Bones of the Upper Limb: Clarict, Scapula, Humerus, Ulna, Radius, Bones of the hand Superior Structures of the Upper Limb: Fascia of the Upper Limb, Cutaneous Nerve, Superficial Veins, Lymphatic Drainage Anterior Thoracoappendicular Muscles: Superficial/D"],["Head",10,"Skull: Walls of the Cranial Cavity Face: (Muscles, Nerves, Vasculature), Parotid Gland Scalp: Layers; Nerves, Vasculature Cranial Meninges: Dura Mate, Dia-Arachnoid, Menigeal Spaces Brain: Parts of the Brain, Ventricular System, Blood Supply, Venous drainage, "],["Neck",10,"Bones of the Neck: Cervical Vertebrae, Hyoid Bone Fascia of the Neck: Superficial/Deep Cervical Fascia Superficial and Lateral Muscles of the Neck: Platysma, Sternocleidomastoid, Trapezius Triangles of the Neck: Anterior/Posterior Triangles Deep Structures of "],["Skin and Appendages",10,"and Appendages Layers of the Skin: Epidermis, Dermis Subataneous Tissue Skin Ligaments Deep fascia Nerve Innervation; Blood Vessels Lymphatic Vessels Skin Appendages: Hairs, Nails, Sweat Glands, Sebaceous Glands, Arrector pilmuscles"],["Histology",10,"Cell and Cell Division Epithelium Glands and Secretion Blood and Blood Cell Formation Tissues: Connective, Adipore, Nervous Muscles Bone Organs (Different Organs of the Body) Immune System Nervous System: Autonomic, Central, Peripheral, Somatosensory and Motor"]]},"Biochemistry": {"k": "BIO","bloom": [0,32,50,18,0,0],"areas": [["Carbohydrates",12,"CARBOHYDRATES biochemistry and functions, Properties and Digestion and Ketogenesis, and disorders. of hormonal metabolism"],["Protein Metabolism",12,"PROTEIN metabolism metabolism (Digestion, catabolism, ammonia and detoxification, acid metabolism), porphyrin and metabolism, Heme and metabolism, metabolism"],["Amino Acids and Proteins",12,"Amino acid and protein (Structure, function, denaturation, chemical reactions, Collagen, Alzheimer’s"],["Genetics and Enzymes",10,"GENETICS and ENZYMES: Gene (Molecular basis of Techniques in biology research, and genetic-based methods), Properties and function, binding, Kinetics, Inhibition"],["Musculoskeletal System and Bioenergetics",10,"MUSCULO SKELETAL SYSTEM: and thermodynamics, of ATP, Biologic oxidation, transport chain, Oxidative Muscle energetics Kreb's cycle, Creatine Nucleic acid chemistry, associated with purine and nucleotide metabolism RESPIRATORY SYSTEM:"],["Respiratory System",10,"of respiration, Role of (Oxygen-Hemoglobin curve, Acid-base"],["Nutrition",12,"NUTRITION: Nutrition and health, chain pyramid, Protein quality, status (Types, assessment), energy nutritional (RENI), Energy expenditure, Vitamins and minerals, and blood components"],["Immunology",10,"IMMUNOLOGY: Innate and immunity (Functions of system, Events in the response, Humoral versus immunity, Antigen, and interaction), Role of MHC Class I and II."],["Cardiovascular System",12,"CARDIOVASCLAR SYSTEM: mechanisms and underlying cardiovascular and diseases such as heart Coronary artery disease, atherosclerosis, Infections, mechanisms to organ dysfunction; energetics"]]},"Legal Medicine": {"k": "LEG","bloom": [9,20,22,30,19,0],"areas": [["Medicolegal Examination",10,"Medicolegal Examination: the evidence to prove against society"],["Medicolegal Cases",50,"of Medicolegal Cases: of human beings as a attesting death, evidence of injury, sexual crimes, to prove violation, of mentality, poisoning other crimes"],["Medicolegal Report",5,"Report"],["Licensure and Regulation of Practice",8,"and regulation of medical in the Philippines"],["Professional Misconduct and Malpractice",9,"that constitute the professional / medical malpractice"],["Relationships with Colleagues, Students, Industry and HMOs",8,"of doctors with other doctors, allied health students, industry, HMO, administrator;"],["Basic Bioethical Principles",10,"Bioethical Principles"]]},"Medicine": {"k": "MED","bloom": [9,23,26,25,17,0],"areas": [["Cardiovascular",15,"Common and Sudden cardiac death. syndrome, cardiovascular disease Coronary artery disease, dysfunction/Heart failure), endocarditis, Myo-pericarditis, heart disease, Valvular heart Dyslipidemia"],["Dermatology",3,"Common skin Disease-related lesions connective tissue disorder,"],["Digestive System",12,"SYSTEM: Gastrointestinal (upper and lower), Liver and portal hypertension. Acute Pancreatitis, Hepatitis, cholecystitis and Diarrhea, Peptic ulcer Acid reflux disease, Infections Cancers of GIT."],["Endocrine System",12,"SYSTEM: Pituitary Diabetes mellitus and Thyroid diseases and Obesity and Metabolic Disorders of the adrenal (Cushing's syndrome, Conn's disease, disease, Pheochromocytoma); of calcium metabolism; gland disorders;"],["Hematology, Immunology and Infections",7,"Leukemia, Allergic disorders, fever, COVID-19, Malaria,"],["Psychiatry",4,"Depression, Anxiety disorder, Bipolar Obssessive Compulsive Acute psychiatric emergency"],["Renal System",12,"SYSTEM: Renal failure, imbalance, tract infection, Glomerular Renal tumors, sexually diseases, Kidney stones"],["Respiratory System",12,"SYTEM: Acute failure, Pneumonias Viral], Pulmonary Chronic obstructive disease, Bronchial asthma, cancer"],["Rheumatology",9,"Arthritis and Connective tissue disorders, tumors"],["Neurology",12,"Vascular disorders Aneurysm, AV malformation, disorder, CNS infections, Rabies, Meningo Degenerative diseases, disease/Dementia, CNS"],["Rehabilitation Medicine",2,"MEDICINE: disorders, post stroke"]]},"Microbiology and Parasitology": {"k": "MIC","bloom": [8,21,53,16,2,0],"areas": [["Respiratory System",15,"System: Upper tract infections: sinusitis, mastoiditis; -acquired pneumonia, pneumonia with acute failure, Bronchitis, Tuberculosis, Bronchiectasis"],["Cardiovascular System",10,"System: Carditis, pericarditis, rheumatic heart"],["Gastrointestinal System",15,"System: Gastroenteritis, Typhoid-Salmonellosis, Cholera Infection: Ascariasis, Tapeworm, Pinworm, dysentery"],["Nervous System",7,"System: Meningitis, PSP Red Tide, Spinal Rabies and other viral of the Nervous System"],["Genitourinary System",8,"System: UTI, cystitis, urethritis, Pelvic disease, genital"],["Reproductive Tract",10,"Tract System: herpes, neonatal herpes, sexually- transmitted - papilloma virus, contagiosum, CMV, (AIDS), cervicitis, prostatitis,"],["Hematopoietic and Lymphatic System",7,"Lymphatic, and System: fever, Malaria, trachomatis venereum), virus"],["Integumentary System",8,"System: Viral (measles, mumps, rubella, smallpox, Fifth fungal skin infections, borne diseases"],["Musculoskeletal System",5,"System: Arthritis, Myositis,"],["Multisystemic Infections",15,"infection: Septicopyemia, HIV-"]]},"Obstetrics and Gynecology": {"k": "OBG","bloom": [0,30,47,16,7,0],"areas": [["Labor and Parturition",8,"Labor and parturition: Mechanism of normal labor, dysfunctional labor or causes of dystocia, signs of labor, premature labor, premature rupture of member, preterm premature rupture of membrane and adolescent pregnancy"],["Prenatal Care and Screening",8,"Prenatal care and screening, diagnosis of pregnancy nutrition, supplements during pregnancy and physiologic changes in pregnancy,"],["Hemorrhagic Complications of Pregnancy",5,"Hemorrhagic complications of pregnancy"],["Early Pregnancy Risk and Bleeding",5,"Early pregnancy risk and bleeding disorders"],["Fetal Complications of Pregnancy",8,"Fetal complications of pregnancy: malpresentation, macrosomia and IUGR"],["Hypertension in Pregnancy",5,"Hypertension during pregnancy"],["Diabetes in Pregnancy",3,"Diabetes during pregnancy"],["Seizures and Medical Illness in Pregnancy",5,"Seizures and Medical Illnesses during pregnancy"],["Surgical Disorders in Pregnancy",3,"Surgical Disorders during pregnancy"],["Perinatal Infections",5,"Perinatal infections such as group B strep, condyloma acuminatum, syphilis, gonorrhea, and others STD that can affect perinatal outcomes and course of labor and manner of delivery"],["Postpartum Care and Complications",5,"Postpartum care and complications"],["Benign Disorders of the Lower Genital Tract",5,"Benign Disorders of the Lower genital tract"],["Benign Disorders of the Upper Genital Tract",5,"Benign Disorders of the Upper genital tract"],["Contraception and Family Planning",3,"Contraception and Family Planning"],["Infections of the Female Reproductive Tract",5,"0. Infections of the female reproductive tract including sexually transmitted diseases"],["Pelvic Prolapse and Urinary Incontinence",3,"Pelvic Prolapse and urinary incontinence"],["Reproductive Endocrinology, Infertility and Menopause",5,"Reproductive Endocrinology and Infertility and Menopause"],["Gynecologic Oncology",5,"Gynecologic Oncology"],["Menstrual Disorders",3,"Abnormalities and diseases affecting the menstrual cycle, i.e. amenorrhea, abnormal uterine bleeding, polyp, endometrial hyperplasia, immature HPA axis, drug induced and blood dyscrasias."],["Contemporary Issues",3,"Contemporary Issues"],["Pediatric and Adolescent Gynecology",3,"Pediatric and adolescent gynecologic problems: Foreign bodies, vaginal agenesis, and labial congenital anomalies, urethral prolapse, vulvovaginitis, vaginal injuries, lichen sclerosis, anogenital injury from sexual abuse, labial adhesions, neoplasms, and other"]]},"Pathology": {"k": "PAT","bloom": [22,8,50,14,6,0],"areas": [["General Pathology",8,"Cell injuries; Apoptosis; Cell and tissue Hypersensitivity Hemodynamic disorders; disease; Shock"],["Developmental and Genetic Disorders",8,"disorders and Mendelian disorders; Disorders; Single disorders with non classic Benign and malignant Grading and staging of Tumor markers"],["Immunopathology",7,"Hypersensitivity Autoimmune diseases; immunodeficiency Acquired associated with aging, malnutrition"],["Environmental and Nutritional Pathology",5,"and nutritional: toxicants (outdoor indoor air pollution, metals as pollutants}; deficiencies (dietary vitamin deficiency)"],["Infectious Diseases",12,"diseases: Transmission dissemination of microbes; responses to Viral infections (acute infections, herpesvirus hepatitis B virus, virus}; Bacterial (gram positive and gram mycobacteria, spirochetes, chlamydia, rickettsia}; infections; Parasitic (protozoa, meta"],["Gastrointestinal Diseases",10,"Diseases: abnormalities of the GIT hernia, Meckel's diverticulum, stenosis, Hirschsprung Diseases of the esophagus reflux esophagitis, Barrett esophagus,tumors); of the stomach (Acute H. pylori, GERD, peptic Zollinger-Ellison, gastric Diseases of the small and"],["Cardiovascular and Collagen Diseases",10,"and Collagen Heart failure (left sided, sided); Congenital (left to right right to left shunts, Ischemic heart disease pectoris, myocardial sudden cardiac death); diseases (systemic heart disease, cor Valvular heart diseases valve prolapse, rheumatic RHD, infe"],["Respiratory Diseases",10,"Diseases: Atelectasis; edema; Acute distress syndrome; and restrictive disease (Emphysema, bronchitis, bronchial bronchiectasis, sarcoidosis, sarcoidosis); of vascular origin embolism, infarction, Pulmonary (community acquired hospital acquired aspiration pneu"],["Hematopoietic and Oncologic Diseases",6,"and Oncologic Anemia of blood loss, anemia, anemia of erythropoiesis, Bleeding disorders, diathesis, DIG, and myeloid neoplasms"],["Genitourinary Disorders",9,"urinary Disorders: tubular and interstitial, and cystic diseases of the Tumors of the kidney; uropathies; Male and genital disorders"],["Endocrine Disorders",6,"Disorders: Disorders of pancreas, adrenals, parathyroid, glands, pituitary gland System Disorders:"],["Nervous System Disorders",9,"diseases; Cerebral hydrocephalus, increased pressure, herniation; Vascular diseases; and demyelinating Tumors"]]},"Pediatrics and Nutrition": {"k": "PED","bloom": [12,19,49,11,9,0],"areas": [["Newborn and Normal Nutrition",10,"Nutrition - Normal breastfeeding, maternal child care, recommended at different speech delay autism, attention deficit global development delay; newborn disorders; RDS, problems; nutritional obesity, specific & vitamin"],["Infectious Diseases",14,"Diphtheria, Cholera, E Gonorrhea, H influenza B, Meningococcal, Pneumococcal, Salmonella, Streptococcal, Tetanus Syphilis VIRAL: AIDS HIV, Dengue Fever, Enteroviral, Cytomegalovirus, Epstein Herpes simplex. Influenza, Roseola, Rubella, Varicella Amebiasis, Gia"],["Respiratory Disorders",10,"Disorders:lIpper: URI vs bacterial), tonsillitis, abscess, croup Lower: bronchitis, pneumonia; Pleural of various etiology; -acute respiratory acidosis, alkalosis,"],["Cardiovascular and Collagen Disorders",9,"Collagen Disorders: heart diseases: of great vessels. 1VSD, ASD, Tetralogy of Fallot, COMPLEX; Acquired diseases: Rheumatic fever, Hypertension; Cardiac CHF, cyanotic spells, bacterial endocarditis, abscess; Collagen disorders: JRA, Kawasaki, dermatomyositis s"],["Central Nervous System Disorders",9,"Nervous System Disorders: seizure disorders benign febrile seizures; encephalitis; Cerebral hydrocephalus; Migraine; Status epilepticus"],["Gastrointestinal Disorders",10,"Disorders: Cause of acquired, Diarrheal disorders and Abdominal pain/ Constipation- functional, disease; Hepatitides cirrhosis; choledochal cyst, Ascites; kerosene, aspirin, INH; food allergy"],["Genitourinary Disorders",10,"Disorders: UTI, AGN, Nephrotic Nephritides, Acute Renal Chronic kidney disease, /acquired renal and disorders, Pelvic disease, sexual abuse, abuse"],["Endocrine and Metabolic Disorders",9,"and Metabolic Disorders: dwarfism, gigantism insipidus, short stature; gland: congenital- hyperthyroidism- disease, goiter, Pancreas: diabetes mellitus,; Adrenals: adrenal hyperplasia, syndrome, neuroblastoma, crisis/ insufficiency"],["Hematologic and Immunologic Disorders",10,"and Immunologic Anemias of various morphologic types disorders- clotting factor DIG, ITP; Vascular ;Rashes: urticaria, AD, dermatitis, angioedema, syndrome, Asthma, rhinitis, Immunodeficiencies, infections, transient form hypogammaglobulinemias; B/T deficiency"],["Neoplastic, Oncologic and Genetic Disorders",9,"Oncologic, Genetic Leukemias and Retinoblastoma; Wilms' Neuroblastoma; Ewings Genetic disorders: sex chromosomal defects, error of metabolism, odd child"]]},"Pharmacology and Therapeutics": {"k": "PHA","bloom": [0,30,51,11,8,0],"areas": [["Cardiovascular",16,"Cardiovascular: Cardiac arrest, heart block, Cardiac Coronary Artery Myocardial ischemia, Infarction and Acute Syndrome, Hypertension Hypertensive Emergencies, and Shock, Heart and Congestive Heart Coronary Artery Disease, Pericarditis, Cardiac Arrest, and Sho"],["Nervous System",15,"Nervous System Headaches and Seizure disorders. Vertigo Dizziness; Cerebrovascular Encephalopathy, Disorders (Psychosis Schizophrenia, Bipolar Depression, Anxiety, disorder, Psychiatric Dementia, Alzheimer's Behavioral disorders Parkinson’s disease and disorde"],["Respiratory System",14,"Respiratory System: Cough and Allergic Rhinitis, Bronchial Chronic Obstructive Diseases (COPD), (Pulmonary Tuberculosis, Bronchitis, Malignancies of the"],["Genitourinary System",16,"Genitourinary System: Urinary Infection (urethritis, cystitis, Nephrolithiasis, Disease, Nephritic Prostatic Diseases Benign Prostatic Sexually Transmitted (Gonorrhea, Herpes Syphilis, Prostatitis, infection, Orchitis), Ulcers, Genital Warts, Pelvic Disease (V"],["Digestive System",12,"Digestive System: Portal and Gastrointestinal Acid-peptic Ulcer Disease, Constipation and diarrhea; Cholangitis, GIT Infection Shigella), Parasitic Hepatitis, Clostridium Candidal Infection); GIT"],["Endocrine System",15,"Endocrine System: Pituitary gland (Dwarfism, gigantism, hyperprolactinemia, insipidus, Diabetes and complications; Thyroid (Hyperthyroidism, thyroid storm); of calcium metabolism; gland disorders; disorders Conn's Cushing syndrome, disease,"],["Cutaneous and Musculoskeletal",12,"Cutaneous and Musculoskeletal Cellulitis and abscess; drug- cutraneous disorders reaction, Steven disease, Toxic epidermal Pain management, Degenerative diseases Arthritis, Infections (Septic TB arthritis); Gouty Connective Tissue diseases psoriasis)"]]},"Physiology": {"k": "PHY","bloom": null,"areas": [["General and Cellular Physiology",15,"General and Cellular Physiology: of biologic organization, structures, functional systems the cell, control systems of the homeostatic mechanisms of functional systems, genetic of protein synthesis, cells and cell reproduction. i.e blood cells-characteristics "],["Cardiovascular System",17,"Cardiovascular System: of the heart, the cycle, the heart as a pump. return, coronary circulation, resistance and Blood regulation, microcirculation lymphatics and fetal and neonatal"],["Respiratory System",12,"Respiratory system: mechanics of pulmonary gas exchange disorders, blood gas transport, of respiration, acid-base and disorders, effects of and sports on respiratory effects of extreme such as flying, place and on physiology of the body"],["Gastrointestinal System",9,"Gastrointestinal System: Sites processes in the intake, digestion, metabolism and excretion carbohydrates, fats and protein, axis, main enzymes mechanism and regulation gut motility, mechanism of stomach response to food \"the alkaline effects of Heliobacter py"],["Endocrine System",12,"Endocrine System: Roles and of the endocrine systems other systems such as the system, Hormone synthesis, action and regulation, structures such as the gland or the anterior pituitary, parathyroid, adrenal cortex, and others involved in endocrine systems, meas"],["Renal and Acid-Base Balance",9,"Renal and Acid Base balance: fluids and their intake and and medulla, structure and determinants of renal blood and GFR, Nephron transport erythropoietin and targets, blood pH"],["Reproductive System",9,"Reproductive system: Sexual main and accessory organs and their functions, of menstrual cycle, and lactation, male and spermatogenesis"],["Neurophysiology",17,"Neurophysiology (includes senses): Nerve stimulus and potential, nerve impulse motor functions of the cord and the cord reflexes, sensory receptors, cortical brain stem control of motor the cerebellum, basal and overall motor control, cortex; intellectual func"]]},"Preventive Medicine": {"k": "PRE","bloom": null,"areas": [["Health Care Provider (Primary Care)",30,"Health Care Provider: Primary Care during clinical rotations in different specialties (Med, Pedia, OB, Surgery; Natural History of Diseases; Disease Causation; Levels of Prevention; Filipino Family; Health Education Promotion and Geriatrics Medicine; Primary H"],["Philippine Health Care System",30,"Structure of the Philippine Health Care System, Basic Health Services; Epidemiology, Disease Outbreak; Communicable Disease; DOH Programs and Services; Environmental Sanitation; Socio- cultural aspect of Disease; Principles of Public Health Administration; Ten"],["Administrative Manager",10,"Manager: Skills; Principles Interpersonal Relationship; Approach; of Adult Learning; health; Bioethics; Care/Hospice; Schools Services and Programs; Principles of Organ Fill-up forms Certificates)"],["Researcher (Research, Biostatistics, Epidemiology)",20,"Researcher: Basic Research process; Biostatistics; Demography; Evidence-based and Medicine; Quality Assurance"],["Social Mobilizer and Leader (Health Laws, DRRM)",10,"Social Mobilizer/Leader: various Laws, Decrees, Executive Order, Proclamation regarding Health and Health Care; Principle of Social Mobilizing; Disaster Risk Reduction and Management"]]},"Surgery": {"k": "SUR","bloom": [20,10,50,14,6,0],"areas": [["Basic Surgical Principles",20,"Surgical Principles - Fluid- Acid-base balance; and metabolic response to Shock and critical care; burns; Wound healing; infection; Asepsis/ Surgical nutrition; Blood Oncology; Immunology; Anesthesia; Patient's quality of surgical care"],["Abdomen I: Esophagus, Stomach, Small Intestine",10,"I - Esophagus hernia, motility GERD, caustic injuries, esophagus, Boerhawe's Mallory Weiss syndrome, and malignant tumors'); and duodenum (peptic ulcer and its complications, benign malignant tumors, upper GI Small intestines ileus, neoplasm, TB); Retroperiton"],["Abdomen II: Biliary Tract, Liver, Pancreas, Spleen",10,"II - Biliary tract gallstones, obstructive Liver (cirrhosis, portal neoplasms); Pancreas and chronic pancreatitis, neoplasms); Spleen for splenectomy, OPSI)"],["Abdomen III: Colon, Rectum, Anus, Appendix",10,"III - Colon, Rectum and (colonic obstruction, lower GI diverticular disease, colo cancer, polyps, hemorrhoids, abscess, anal fistula/ Appendix (appendicitis)"],["Head and Neck, Thyroid and ENT",10,"and neck (benign/ malignant salivary glands, trauma); gland (hyperthyroidism, goiter, solitary nodules, cancer) Parathyroid gland Endocrine, and bariatric surgery (nasal polyps/ vertigo, hearing loss, ENT"],["Breast, Hernia and Soft Tissue",10,"(benign and malignant breast Hernia (groin, congenital/ abdominal wall hernia); and soft tissue (sarcoma, benign"],["Specialty I: Neurosurgery and Ophthalmology",10,"I - (CNS/ peripheral nerve neurosurgical emergencies - 1CP, bleeding, trauma; CNS (glaucoma, cataract, emergencies);"],["Specialty II: Thoracic, Vascular, Urology, Gynecology",10,"II - (pleural effusion, lung cancer, masses, congenital/ heart disease, aortic peripheral vascular (tumors, infections, stones, prostatic cancer); (vaginal bleeding, ovarian benign/ malignant uterine"],["Specialty III: Plastic, Orthopedic and Pediatric Surgery",10,"III: Surgery (skin grafting, of reconstructive surgery, trauma, aesthetic surgery); (benign/ malignant bone fractures, infections); Surgery (inguinal hernia, hernia, esophageal tumors, intestinal jaundice, Hirschsprung's"]]}};
function tosAreas_(subject) {
  const t = TOS[subject];
  return t ? t.areas.map((a, i) => ({ code: t.k + '-' + (i + 1), name: a[0], items: a[1], desc: a[2] })) : [];
}
function tosArea_(code) {
  const m = String(code || '').match(/^([A-Z]{3})-(\d+)$/);
  if (!m) return null;
  const s = Object.keys(TOS).find(x => TOS[x].k === m[1]);
  const a = s && TOS[s].areas[+m[2] - 1];
  return a ? { code: code, subject: s, name: a[0], items: a[1], desc: a[2] } : null;
}
function tosMeta() {
  return Object.keys(TOS).map(s => ({ subject: s, bloom: TOS[s].bloom, areas: tosAreas_(s).map(a => ({ code: a.code, name: a.name, items: a.items })) }));
}
const pleCache_ = {};
/** Maps a deck/subject name to one of the 12 official PLE subjects ('' if none fits). */
function pleName_(s) {
  const key = String(s || '');
  if (key in pleCache_) return pleCache_[key];
  const t = ' ' + key.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  let out = '';
  for (let i = 0; i < PLE_RULES_.length && t.trim(); i++) if (PLE_RULES_[i][0].test(t)) { out = PLE_RULES_[i][1]; break; }
  return (pleCache_[key] = out);
}

/* ---------- Menu / setup ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu(APP_NAME)
    .addItem('Set up sheets', 'setup')
    .addItem('Re-index media folder', 'menuIndexMedia')
    .addToUi();
}

function setup() {
  Object.keys(SH).forEach(k => sheet_(k));
  return 'ok';
}

function menuIndexMedia() {
  const r = indexMediaFolder('');
  SpreadsheetApp.getUi().alert('Indexed ' + r.count + ' media files from "' + r.folder + '".');
}

/* ---------- Web app ---------- */
function doGet() {
  setup();
  return HtmlService.createTemplateFromFile('Index').evaluate()
    .setTitle(APP_NAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(f) {
  return HtmlService.createHtmlOutputFromFile(f).getContent();
}

/* ---------- Sheet helpers ---------- */
function sheet_(key) {
  const [name, head] = SH[key];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
    sh.setFrozenRows(1);
    if (key === 'Q') sh.getRange(1, 1, sh.getMaxRows(), 13).setNumberFormat('@'); // keep "1/2" etc. as text
  } else if (sh.getLastColumn() < head.length) {
    sh.getRange(1, 1, 1, head.length).setValues([head]).setFontWeight('bold');
  }
  return sh;
}

function rows_(key) {
  const sh = sheet_(key);
  const head = SH[key][1];
  const n = sh.getLastRow();
  if (n < 2) return [];
  return sh.getRange(2, 1, n - 1, head.length).getValues().map(r => {
    const o = {};
    head.forEach((h, i) => { o[h] = r[i] instanceof Date ? r[i].toISOString() : r[i]; });
    return o;
  });
}

function getSettings_() {
  const sh = sheet_('C'), n = sh.getLastRow(), o = {};
  if (n < 2) return o;
  const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();
  // Sheets turns typed dates (e.g. the exam date) into Date cells; send them back as plain yyyy-MM-dd
  sh.getRange(2, 1, n - 1, 2).getValues().forEach(([k, v]) => {
    if (k) o[k] = v instanceof Date ? Utilities.formatDate(v, tz, 'yyyy-MM-dd') : String(v);
  });
  return o;
}

function setSetting_(key, value) {
  const sh = sheet_('C');
  const n = sh.getLastRow();
  const keys = n > 1 ? sh.getRange(2, 1, n - 1, 1).getValues().map(r => r[0]) : [];
  const i = keys.indexOf(key);
  if (i >= 0) sh.getRange(i + 2, 2).setValue(value);
  else sh.appendRow([key, value]);
}

function saveSettings(obj) {
  Object.keys(obj || {}).forEach(k => setSetting_(k, obj[k]));
  return getSettings_();
}

function subj_(s) { const raw = String(s || '').trim(); return pleName_(raw) || raw || 'Uncategorized'; }
function isTrue_(v) { return v === true || String(v).toUpperCase() === 'TRUE'; }
function fmtDate_(iso, f) {
  return iso ? Utilities.formatDate(new Date(iso), Session.getScriptTimeZone(), f || 'MMM d') : '';
}

/* ---------- Bootstrap ---------- */
function getBootstrap() {
  const counts = {};
  rows_('Q').forEach(q => { const s = subj_(q.Subject); counts[s] = (counts[s] || 0) + 1; });
  return {
    settings: getSettings_(),
    subjects: Object.keys(counts).sort().map(s => ({ name: s, count: counts[s] })),
    email: Session.getActiveUser().getEmail(),
    ai: aiStatus_(),
    tos: tosMeta(),
  };
}

/* ---------- Analytics ---------- */
function getAnalytics() {
  const qs = rows_('Q'), rs = rows_('R'), ss = rows_('S');
  const per = {};
  const ensure = s => per[s] || (per[s] = { subject: s, bank: 0, attempts: 0, correct: 0, seen: {}, seq: [] });
  PLE.forEach(p => ensure(p[0]));
  qs.forEach(q => ensure(subj_(q.Subject)).bank++);
  let correct = 0;
  const seenAll = {};
  rs.forEach(r => {
    const p = ensure(subj_(r.Subject));
    p.attempts++;
    if (isTrue_(r.Correct)) { p.correct++; correct++; }
    p.seq.push(isTrue_(r.Correct));
    p.seen[r.QuestionID] = 1;
    seenAll[r.QuestionID] = 1;
  });
  const mastery = Object.keys(per).map(k => {
    const p = per[k], seen = Object.keys(p.seen).length;
    return {
      subject: p.subject, bank: p.bank, attempts: p.attempts, correct: p.correct, seen: seen,
      accuracy: p.attempts ? Math.round(p.correct / p.attempts * 1000) / 10 : 0,
      coverage: p.bank ? Math.round(Math.min(seen, p.bank) / p.bank * 1000) / 10 : 0,
    };
  }).sort((a, b) => a.accuracy - b.accuracy || a.coverage - b.coverage);

  const trend = ss.filter(s => s.Finished).slice(-20).map(s => ({
    id: s.SessionID, date: fmtDate_(s.Finished), score: Number(s.ScorePct) || 0,
    total: Number(s.Total) || 0, correct: Number(s.Correct) || 0, mode: s.Mode, subjects: s.Subjects,
  }));

  // PLE projection: last 100 answers per subject (one exam block's worth)
  const pleSubs = PLE.map(([name, day, time]) => {
    const p = per[name], last = p.seq.slice(-100), c = last.filter(Boolean).length;
    return { subject: name, day: day, time: time, bank: p.bank, attempts: p.attempts,
      recent: last.length ? Math.round(c / last.length * 1000) / 10 : null, recentN: last.length };
  });
  const tested = pleSubs.filter(x => x.recent != null);
  const ga = tested.length ? Math.round(tested.reduce((s, x) => s + x.recent, 0) / tested.length * 10) / 10 : null;
  const below50 = tested.filter(x => x.recent < 50).length;
  const ple = {
    subjects: pleSubs, ga: ga, tested: tested.length, below50: below50, below75: tested.filter(x => x.recent < 75).length,
    verdict: !tested.length ? 'none' : tested.length < 12 ? 'incomplete' : (ga >= 75 && !below50 ? 'pass' : 'fail'),
  };

  // TOS areas: items on the exam vs. your bank and accuracy
  const qArea = {}, areaBank = {}, untagged = {};
  qs.forEach(q => {
    const s = subj_(q.Subject);
    qArea[String(q.ID)] = q.TOSArea;
    if (q.TOSArea) areaBank[q.TOSArea] = (areaBank[q.TOSArea] || 0) + 1; else if (TOS[s]) untagged[s] = (untagged[s] || 0) + 1;
  });
  const areaRes = {};
  rs.forEach(r => { const k = qArea[String(r.QuestionID)]; if (!k) return; const x = areaRes[k] || (areaRes[k] = { n: 0, c: 0 }); x.n++; if (isTrue_(r.Correct)) x.c++; });
  const tos = PLE.map(p => p[0]).filter(s => TOS[s]).map(s => ({
    subject: s, bloom: TOS[s].bloom, untagged: untagged[s] || 0,
    areas: tosAreas_(s).map(a => {
      const x = areaRes[a.code] || { n: 0, c: 0 };
      return { code: a.code, name: a.name, items: a.items, bank: areaBank[a.code] || 0, attempts: x.n, correct: x.c, accuracy: x.n ? Math.round(x.c / x.n * 1000) / 10 : null };
    }),
  }));

  // Heatmap: accuracy per subject in each of the last 10 sessions
  const lastIds = ss.filter(s => s.Finished).slice(-10).map(s => String(s.SessionID));
  const cell = {};
  rs.forEach(r => {
    const sid = String(r.SessionID);
    if (lastIds.indexOf(sid) < 0) return;
    const k = subj_(r.Subject) + '|' + sid;
    const c = cell[k] || (cell[k] = { n: 0, c: 0 });
    c.n++; if (isTrue_(r.Correct)) c.c++;
  });
  const heat = {
    sessions: ss.filter(s => lastIds.indexOf(String(s.SessionID)) >= 0).map(s => fmtDate_(s.Finished)),
    rows: mastery.filter(m => m.attempts).map(m => ({
      subject: m.subject,
      cells: lastIds.map(id => { const c = cell[m.subject + '|' + id]; return c ? Math.round(c.c / c.n * 100) : null; }),
    })).sort((a, b) => a.subject.localeCompare(b.subject)),
  };

  // Item difficulty from your own attempts
  const item = {};
  let secs = 0, timed = 0;
  rs.forEach(r => {
    const it = item[r.QuestionID] || (item[r.QuestionID] = { n: 0, c: 0 });
    it.n++; if (isTrue_(r.Correct)) it.c++;
    if (Number(r.Seconds) > 0) { secs += Number(r.Seconds); timed++; }
  });
  const diff = { easy: 0, medium: 0, hard: 0 };
  Object.keys(item).forEach(k => { const p = item[k].c / item[k].n; diff[p >= 0.7 ? 'easy' : p >= 0.4 ? 'medium' : 'hard']++; });

  return {
    tos: tos,
    ple: ple,
    heat: heat,
    difficulty: diff,
    best: trend.reduce((m, t) => Math.max(m, t.score), 0),
    avgSeconds: timed ? Math.round(secs / timed) : 0,
    mastery: mastery,
    focus: mastery.filter(m => m.bank > 0).slice(0, 3),
    trend: trend,
    recent: trend.slice(-8).reverse(),
    totals: {
      bank: qs.length, answered: rs.length, correct: correct, seen: Object.keys(seenAll).length,
      accuracy: rs.length ? Math.round(correct / rs.length * 1000) / 10 : 0, sessions: ss.length,
    },
  };
}

/* ---------- Quiz ---------- */
function toClient_(q) {
  return {
    id: String(q.ID), subject: subj_(q.Subject), topic: String(q.Topic || ''),
    question: String(q.Question || ''),
    choices: ['A', 'B', 'C', 'D', 'E'].filter(L => String(q[L]).trim() !== '').map(L => ({ key: L, html: String(q[L]) })),
    answer: String(q.Answer || '').trim().toUpperCase(),
    rationale: String(q.Rationale || ''), tags: String(q.Tags || ''),
    area: String(q.TOSArea || ''), areaName: (tosArea_(q.TOSArea) || {}).name || '',
  };
}

/** opts: {subjects:[], count, mode:'tutor'|'exam', pool:'all'|'unseen'|'wrong'} */
function createQuiz(opts) {
  opts = opts || {};
  const subjects = opts.subjects || [];
  const count = Math.max(1, Math.min(Number(opts.count) || 20, 300));
  const deck = opts.deck == null ? null : String(opts.deck);
  let qs = rows_('Q').filter(q => q.Question && (!subjects.length || subjects.indexOf(subj_(q.Subject)) >= 0) && (!opts.area || q.TOSArea === opts.area) && (deck == null || deckKey_(q) === deck));

  if (opts.pool === 'unseen' || opts.pool === 'wrong') {
    const last = {};
    rows_('R').forEach(r => { last[String(r.QuestionID)] = isTrue_(r.Correct); }); // latest attempt wins
    qs = qs.filter(q => opts.pool === 'unseen' ? !(String(q.ID) in last) : last[String(q.ID)] === false);
  }
  if (!opts.ordered) for (let i = qs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [qs[i], qs[j]] = [qs[j], qs[i]]; }
  if (opts.block && deck == null && subjects.length === 1 && TOS[subjects[0]]) qs = tosSample_(qs, subjects[0], count);
  return {
    sessionId: Utilities.getUuid().slice(0, 8),
    questions: qs.slice(0, count).map(toClient_).filter(q => q.choices.length >= 2),
  };
}

/** Picks items so each TOS area gets its share of the block (e.g. 12 of 100 for a 12% area); gaps are filled from the rest. */
function tosSample_(qs, subject, count) {
  const areas = tosAreas_(subject), seen = {};
  rows_('R').forEach(r => { seen[String(r.QuestionID)] = 1; });
  const pool = {}, rest = [];
  qs.forEach(q => { (pool[q.TOSArea] ? pool[q.TOSArea] : (areas.some(a => a.code === q.TOSArea) ? (pool[q.TOSArea] = []) : rest)).push(q); });
  Object.keys(pool).forEach(k => pool[k].sort((a, b) => (seen[String(a.ID)] ? 1 : 0) - (seen[String(b.ID)] ? 1 : 0)));
  const raw = areas.map(a => a.items * count / 100), quota = raw.map(Math.floor);
  let left = count - quota.reduce((s, x) => s + x, 0);
  raw.map((x, i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (left > 0) { quota[i]++; left--; } });
  const picked = [];
  areas.forEach((a, i) => { const p = pool[a.code] || []; picked.push(...p.splice(0, quota[i])); });
  const leftovers = rest.concat(...Object.keys(pool).map(k => pool[k]));
  for (let i = leftovers.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [leftovers[i], leftovers[j]] = [leftovers[j], leftovers[i]]; }
  while (picked.length < count && leftovers.length) picked.push(leftovers.shift());
  for (let i = picked.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [picked[i], picked[j]] = [picked[j], picked[i]]; }
  return picked;
}

/** p: {sessionId, mode, subjects, started(ms), answers:[{id, chosen, seconds}]} */
function submitSession(p) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const key = {};
    rows_('Q').forEach(q => { key[String(q.ID)] = { a: String(q.Answer || '').trim().toUpperCase(), s: subj_(q.Subject) }; });
    const now = new Date();
    let correct = 0;
    const out = (p.answers || []).filter(a => a.chosen).map(a => {
      const k = key[a.id] || { a: '', s: 'Uncategorized' };
      const ok = !!k.a && a.chosen === k.a;
      if (ok) correct++;
      return [now, p.sessionId, a.id, k.s, a.chosen, k.a, ok, Number(a.seconds) || 0];
    });
    if (out.length) {
      const sh = sheet_('R');
      sh.getRange(sh.getLastRow() + 1, 1, out.length, out[0].length).setValues(out);
    }
    const total = (p.answers || []).length;
    const score = total ? Math.round(correct / total * 1000) / 10 : 0;
    sheet_('S').appendRow([p.sessionId, new Date(p.started || now), now, p.mode,
      (p.subjects || []).join(', ') || 'All subjects', total, correct, score]);
    return { total: total, correct: correct, score: score, answered: out.length };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Question bank ---------- */
/* ---------- Decks (practice tests) ---------- */
function deckKey_(q) { return String(q.Deck || q.Topic || '').trim(); }
function natCmp_(a, b) { return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' }); }

/** One entry per subject + deck: item count, how many answered, latest-attempt score. */
function getDecks(subject) {
  const last = {};
  rows_('R').forEach(r => { last[String(r.QuestionID)] = isTrue_(r.Correct); });
  const by = {};
  rows_('Q').forEach(q => {
    if (!q.Question) return;
    const s = subj_(q.Subject);
    if (subject && s !== subject) return;
    const k = deckKey_(q), id = String(q.ID);
    const d = by[s + '\u0001' + k] || (by[s + '\u0001' + k] = { subject: s, key: k, count: 0, seen: 0, right: 0 });
    d.count++;
    if (id in last) { d.seen++; if (last[id]) d.right++; }
  });
  return Object.keys(by).map(x => by[x]).map(d => Object.assign(d, { accuracy: d.seen ? Math.round(d.right / d.seen * 100) : null }))
    .sort((a, b) => natCmp_(a.subject, b.subject) || natCmp_(a.key, b.key));
}

function listQuestions(opts) {
  opts = opts || {};
  const term = String(opts.search || '').toLowerCase().trim();
  const size = Number(opts.size) || 20, page = Number(opts.page) || 0;
  const strip = s => String(s || '').replace(/<[^>]+>/g, ' ');
  const items = rows_('Q').filter(q =>
    (!opts.subject || subj_(q.Subject) === opts.subject) &&
    (opts.deck == null || deckKey_(q) === String(opts.deck)) &&
    (!term || (strip(q.Question) + ' ' + q.Topic + ' ' + q.Tags + ' ' + q.ID).toLowerCase().indexOf(term) >= 0));
  return { total: items.length, page: page, size: size, items: items.slice(page * size, (page + 1) * size).map(toClient_) };
}

/* ---------- Delete a deck (moved to hidden Trash sheets, not destroyed) ---------- */
/** Removes every question in subject + deck, plus your answers to them and cached AI explanations.
 *  Questions and answers are copied to hidden "Trash Questions" / "Trash Results" sheets first. */
function deleteDeck(subject, key) {
  subject = String(subject || ''); key = String(key == null ? '' : key).trim();
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const stamp = new Date(), head = SH.Q[1], ids = {};
    const iS = head.indexOf('Subject'), iT = head.indexOf('Topic'), iD = head.indexOf('Deck');
    const questions = moveRows_('Q', r => {
      const hit = subj_(r[iS]) === subject && String(r[iD] || r[iT] || '').trim() === key;
      if (hit) ids[String(r[0])] = 1;
      return hit;
    }, 'Trash Questions', stamp);
    if (!questions) return { questions: 0, results: 0 };
    const results = moveRows_('R', r => ids[String(r[2])] === 1, 'Trash Results', stamp);
    moveRows_('A', r => ids[String(r[0])] === 1, null, stamp); // AI explanations can be regenerated
    return { questions: questions, results: results };
  } finally {
    lock.releaseLock();
  }
}

/** Deletes rows matching pred (row array) from a sheet, copying them to a trash sheet first. Returns count. */
function moveRows_(key, pred, trashName, stamp) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SH[key][0]);
  if (!sh || sh.getLastRow() < 2) return 0;
  const w = sh.getLastColumn(), data = sh.getRange(2, 1, sh.getLastRow() - 1, w).getValues();
  const hits = [];
  data.forEach((r, i) => { if (pred(r)) hits.push(i); });
  if (!hits.length) return 0;
  if (trashName) trash_(trashName, sh.getRange(1, 1, 1, w).getValues()[0], hits.map(i => data[i]), stamp, key === 'Q');
  if (hits.length === data.length) { // Sheets refuses to delete every unfrozen row, so keep one blank row
    if (data.length > 1) sh.deleteRows(3, data.length - 1);
    sh.getRange(2, 1, 1, w).clearContent();
    return hits.length;
  }
  for (let j = hits.length - 1; j >= 0;) { // delete bottom-up in contiguous blocks
    const end = hits[j]; let start = end;
    while (j > 0 && hits[j - 1] === start - 1) { start--; j--; }
    j--;
    sh.deleteRows(start + 2, end - start + 1);
  }
  return hits.length;
}

function trash_(name, head, rows, stamp, asText) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let t = ss.getSheetByName(name);
  if (!t) {
    t = ss.insertSheet(name);
    t.getRange(1, 1, 1, head.length + 1).setValues([['DeletedAt'].concat(head)]).setFontWeight('bold');
    t.setFrozenRows(1);
    t.hideSheet();
  }
  const out = rows.map(r => [stamp].concat(r)), at = t.getLastRow() + 1;
  if (t.getMaxColumns() < out[0].length) t.insertColumnsAfter(t.getMaxColumns(), out[0].length - t.getMaxColumns());
  if (asText) t.getRange(at, 2, out.length, 13).setNumberFormat('@'); // keep "1/2" etc. as text, like Questions
  t.getRange(at, 1, out.length, out[0].length).setValues(out);
}

/** Empties the whole question bank: every question, answer, session and AI explanation.
 *  Questions, answers and sessions are copied to hidden Trash sheets first. */
function deleteAllQuestions() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const stamp = new Date(), all = () => true;
    const questions = moveRows_('Q', all, 'Trash Questions', stamp);
    const results = moveRows_('R', all, 'Trash Results', stamp);
    const sessions = moveRows_('S', all, 'Trash Sessions', stamp);
    moveRows_('A', all, null, stamp);
    return { questions: questions, results: results, sessions: sessions };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Anki import ---------- */
/** items: [{guid, subject, topic, question, choices[5], answer, rationale, tags}] — upserts by GUID */
function importRows(items) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh = sheet_('Q'), head = SH.Q[1], n = sh.getLastRow();
    const data = n > 1 ? sh.getRange(2, 1, n - 1, head.length).getValues() : [];
    const gi = head.indexOf('AnkiGUID');
    const byGuid = {};
    data.forEach((r, i) => { if (r[gi]) byGuid[r[gi]] = { where: 'old', i: i }; });
    let maxId = data.reduce((m, r) => Math.max(m, parseInt(String(r[0]).replace(/\D/g, ''), 10) || 0), 0);
    let added = 0, updated = 0, truncated = 0;
    const now = new Date(), fresh = [];
    const cell = s => {
      s = String(s == null ? '' : s);
      if (s.length > 49000) { truncated++; s = s.slice(0, 49000); }
      return /^[=+\-@]/.test(s) ? "'" + s : s;
    };
    (items || []).forEach(it => {
      const ch = (it.choices || []).slice(0, 5);
      while (ch.length < 5) ch.push('');
      const vals = [null, cell(subj_(it.subject)), cell(it.topic), cell(it.question)]
        .concat(ch.map(cell), [cell(it.answer), cell(it.rationale), cell(it.tags), cell(it.guid), now, cell(it.area), cell(it.deck)]);
      const hit = it.guid && byGuid[it.guid];
      if (hit && hit.where === 'old') { vals[0] = data[hit.i][0]; if (!it.area) vals[14] = data[hit.i][14] || ''; if (!it.deck) vals[15] = data[hit.i][15] || ''; data[hit.i] = vals; updated++; }
      else if (hit && hit.where === 'new') { vals[0] = fresh[hit.i][0]; fresh[hit.i] = vals; }
      else {
        vals[0] = 'Q' + String(++maxId).padStart(5, '0');
        fresh.push(vals); added++;
        if (it.guid) byGuid[it.guid] = { where: 'new', i: fresh.length - 1 };
      }
    });
    if (updated) sh.getRange(2, 1, data.length, head.length).setValues(data);
    if (fresh.length) sh.getRange(sh.getLastRow() + 1, 1, fresh.length, head.length).setValues(fresh);
    return { added: added, updated: updated, truncated: truncated };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Tagging questions to TOS areas ---------- */
const TOS_SYN_ = [
  [/pulmo|lung|pneum|asthm|bronch|copd|pleur|tuberc/, ' respi '], [/heart|coronar|myocard|angina|arrhyth|cardiac|valv|aort/, ' cardi vascu '],
  [/liver|hepat|bowel|colon|gastr|intestin|stomach|pancrea|biliar|esophag|diarrh| gi /, ' gastr diges abdom '], [/kidney|renal|nephr|urinar|bladder|prostat/, ' renal urina genit '],
  [/thyro|diabet|adrenal|pituitar|insulin|endocr|cortisol/, ' endoc '], [/brain|seizur|stroke|mening|neuro|nerve|epilep|spinal cord/, ' neuro nervo centr '],
  [/anemi|leuk|lymphom|coagul|platelet|hemat|blood/, ' hemat hemop '], [/skin|derma|rash|eczem|psorias|integum/, ' derma integ cutan skin '],
  [/joint|arthr|bone|muscl|fractur|osteo/, ' muscu skele '], [/depress|anxiet|schizo|bipolar|psych/, ' psych '],
  [/pregnan|gestat|labor|obstet|fetal|fetus/, ' pregn '], [/infect|bacteri|viral|virus|parasit|fung/, ' infec '],
];
const TOS_STOP_ = { disea: 1, disor: 1, syste: 1, clini: 1, manag: 1, treat: 1, patie: 1, assoc: 1, commo: 1, inclu: 1, other: 1, these: 1, which: 1, their: 1, diagn: 1, given: 1, funct: 1, struc: 1, princ: 1, basic: 1, types: 1, relat: 1 };
function tosStems_(text) {
  let t = ' ' + String(text || '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z ]+/g, ' ') + ' ';
  TOS_SYN_.forEach(([re, add]) => { if (re.test(t)) t += add; });
  const out = {};
  t.split(/\s+/).forEach(w => { if (w.length >= 5) { const s = w.slice(0, 5); if (!TOS_STOP_[s]) out[s] = 1; } });
  return out;
}
/** Free keyword pass: tags untagged items when one area clearly matches the deck topic and question text. */
function tosAutoTag() {
  const sh = sheet_('Q'), head = SH.Q[1], n = sh.getLastRow();
  if (n < 2) return { tagged: 0, remaining: 0 };
  const data = sh.getRange(2, 1, n - 1, head.length).getValues();
  const ci = head.indexOf('TOSArea'), prof = {};
  Object.keys(TOS).forEach(s => { prof[s] = tosAreas_(s).map(a => ({ code: a.code, stems: Object.assign(tosStems_(a.desc), Object.keys(tosStems_(a.name)).reduce((o, k) => (o[k] = 2, o), {})) })); });
  let tagged = 0, remaining = 0;
  const col = data.map(r => {
    if (r[ci]) return [r[ci]];
    const s = subj_(r[1]);
    if (!prof[s]) return [''];
    const top = tosStems_(r[2]), body = tosStems_(String(r[3]).slice(0, 1500) + ' ' + String(r[10]).slice(0, 800));
    const sc = prof[s].map(a => {
      let x = 0;
      Object.keys(a.stems).forEach(k => { if (top[k]) x += 3 * a.stems[k]; if (body[k]) x += a.stems[k]; });
      return [x, a.code];
    }).sort((a, b) => b[0] - a[0]);
    if (sc[0][0] >= 3 && sc[0][0] > (sc[1] ? sc[1][0] : 0) + 1) { tagged++; return [sc[0][1]]; }
    remaining++; return [''];
  });
  sh.getRange(2, ci + 1, col.length, 1).setValues(col);
  return { tagged: tagged, remaining: remaining };
}
/** AI pass: tags up to n untagged items of one subject per call (call again until remaining is 0). */
function aiTagBatch(n) {
  n = Math.max(5, Math.min(Number(n) || 30, 50));
  const sh = sheet_('Q'), head = SH.Q[1], last = sh.getLastRow();
  if (last < 2) return { tagged: 0, remaining: 0 };
  const data = sh.getRange(2, 1, last - 1, head.length).getValues(), ci = head.indexOf('TOSArea');
  const todo = data.map((r, i) => ({ i: i, s: subj_(r[1]), r: r })).filter(x => !x.r[ci] && TOS[x.s] && x.r[3]);
  if (!todo.length) return { tagged: 0, remaining: 0 };
  const subject = todo[0].s, batch = todo.filter(x => x.s === subject).slice(0, n), areas = tosAreas_(subject);
  const prompt = 'Subject: ' + subject + '\nTable of Specifications areas:\n' + areas.map(a => a.code + ': ' + a.name + ' (' + a.desc + ')').join('\n') +
    '\n\nAssign each question below to the ONE best-fitting area code.\n\n' +
    batch.map(x => 'ID ' + x.r[0] + ': ' + plain_(x.r[3]).slice(0, 400) + (x.r[2] ? ' [deck topic: ' + x.r[2] + ']' : '')).join('\n\n') +
    '\n\nReturn ONLY a JSON object mapping each ID to an area code, e.g. {"Q00012": "' + areas[0].code + '"}.';
  const out = callAI_('You classify medical board questions into the Philippine PLE Table of Specifications. Answer with JSON only.', prompt, true);
  const valid = {}; areas.forEach(a => valid[a.code] = 1);
  let tagged = 0;
  batch.forEach(x => { const c = String((out || {})[x.r[0]] || '').trim().toUpperCase(); if (valid[c]) { sh.getRange(x.i + 2, ci + 1).setValue(c); tagged++; } });
  return { tagged: tagged, remaining: todo.length - tagged, subject: subject };
}
function setQuestionArea(id, code) {
  const sh = sheet_('Q'), head = SH.Q[1], n = sh.getLastRow();
  const ids = sh.getRange(2, 1, n - 1, 1).getValues().map(r => String(r[0])), i = ids.indexOf(String(id));
  if (i < 0) throw new Error('Question not found.');
  if (code && !tosArea_(code)) throw new Error('Unknown TOS area.');
  sh.getRange(i + 2, head.indexOf('TOSArea') + 1).setValue(code || '');
  return { id: id, area: code || '', areaName: (tosArea_(code) || {}).name || '' };
}

/* ---------- Media (images / videos stored in a Drive folder) ---------- */
function folderId_(input) {
  const s = String(input || '').trim();
  const m = s.match(/folders\/([a-zA-Z0-9_-]+)/) || s.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return m ? m[1] : s;
}

function indexMediaFolder(input) {
  const id = folderId_(input) || getSettings_().MediaFolderId;
  if (!id) throw new Error('Paste the link of your Drive media folder first.');
  const root = DriveApp.getFolderById(id);
  setSetting_('MediaFolderId', id);
  const out = [];
  const walk = f => {
    const files = f.getFiles();
    while (files.hasNext()) {
      const x = files.next();
      out.push([x.getName(), x.getId(), x.getMimeType(), Math.round(x.getSize() / 1024)]);
    }
    const subs = f.getFolders();
    while (subs.hasNext()) walk(subs.next());
  };
  walk(root);
  const sh = sheet_('M');
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 4).clearContent();
  if (out.length) sh.getRange(2, 1, out.length, 4).setValues(out);
  CacheService.getScriptCache().remove('mediaIndex');
  return { count: out.length, folder: root.getName() };
}

/* Media uploaded straight from an .apkg goes into a "BetterMed media" Drive folder (or the linked one). */
function mediaFolder_() {
  const id = getSettings_().MediaFolderId;
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) { } }
  const f = DriveApp.createFolder(APP_NAME + ' media');
  setSetting_('MediaFolderId', f.getId());
  return f;
}

function mediaHave(names) {
  const idx = mediaIndex_();
  return (names || []).filter(n => idx[n]);
}

function saveMedia(files) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const folder = mediaFolder_(), idx = mediaIndex_(), out = [];
    (files || []).forEach(f => {
      if (!f || !f.name || idx[f.name]) return;
      const x = folder.createFile(Utilities.newBlob(Utilities.base64Decode(f.b64), f.mime || 'application/octet-stream', f.name));
      out.push([f.name, x.getId(), f.mime || x.getMimeType(), Math.round(x.getSize() / 1024)]);
      idx[f.name] = 1;
    });
    if (out.length) {
      const sh = sheet_('M');
      sh.getRange(sh.getLastRow() + 1, 1, out.length, 4).setValues(out);
      CacheService.getScriptCache().remove('mediaIndex');
    }
    return { saved: out.length, folderId: folder.getId(), folder: folder.getName() };
  } finally { lock.releaseLock(); }
}

function mediaIndex_() {
  const map = {};
  rows_('M').forEach(r => { if (r.Filename) { map[r.Filename] = r; map[String(r.Filename).toLowerCase()] = r; } });
  return map;
}

/** Returns {name: {type:'image'|'video'|'audio'|'missing', src}} */
function getMediaBatch(names) {
  const idx = mediaIndex_(), cache = CacheService.getScriptCache(), out = {};
  (names || []).forEach(name => {
    let dec = name;
    try { dec = decodeURIComponent(name); } catch (e) {}
    const m = idx[name] || idx[dec] || idx[String(dec).toLowerCase()];
    if (!m) { out[name] = { type: 'missing' }; return; }
    const mime = String(m.MimeType);
    if (/^image\//.test(mime)) {
      const ck = 'img:' + m.FileId;
      let src = cache.get(ck);
      if (!src) {
        const blob = DriveApp.getFileById(m.FileId).getBlob();
        src = 'data:' + mime + ';base64,' + Utilities.base64Encode(blob.getBytes());
        if (src.length < 95000) cache.put(ck, src, 21600);
      }
      out[name] = { type: 'image', src: src };
    } else {
      out[name] = { type: /^audio\//.test(mime) ? 'audio' : 'video', src: 'https://drive.google.com/file/d/' + m.FileId + '/preview' };
    }
  });
  return out;
}

/* ---------- AI (Gemini or Claude) ---------- */
const SYS_TUTOR = 'You are a concise, accurate medical board-review tutor for a Filipino physician preparing for the Philippine Physician Licensure Exam (PLE). ' +
  'Draw on standard references (Harrison, Robbins, Guyton, Katzung, Williams, Nelson, Schwartz) and Philippine guidelines and laws (DOH, PhilHealth, Legal Medicine) where relevant. ' +
  'Never invent citations or statistics. If you are unsure, say so. Write in plain English with short markdown: **bold**, "- " bullets, "### " headings; no tables.';

function aiConfig_() {
  const st = getSettings_();
  return {
    provider: st.AIProvider === 'claude' ? 'claude' : 'gemini',
    model: st.AIModel || '',
    key: PropertiesService.getUserProperties().getProperty('AI_KEY') || '',
  };
}
function aiStatus_() {
  const c = aiConfig_();
  return { provider: c.provider, model: c.model || (c.provider === 'claude' ? 'claude-sonnet-5-5' : 'gemini-3.8-flash'), hasKey: !!c.key };
}
/** Saves provider/model in Settings and the key privately in your user properties (never in the Sheet). */
function saveAiSettings(o) {
  o = o || {};
  if (o.provider) setSetting_('AIProvider', o.provider);
  if (o.model != null) setSetting_('AIModel', String(o.model).trim());
  const p = PropertiesService.getUserProperties();
  if (o.key === '__clear__') p.deleteProperty('AI_KEY');
  else if (o.key) p.setProperty('AI_KEY', String(o.key).trim());
  return aiStatus_();
}

function callAI_(system, prompt, wantJson) {
  const c = aiConfig_();
  if (!c.key) throw new Error('Add your AI API key in Settings first.');
  let url, payload, headers;
  if (c.provider === 'claude') {
    url = 'https://api.anthropic.com/v1/messages';
    headers = { 'x-api-key': c.key, 'anthropic-version': '2023-06-01' };
    payload = { model: c.model || 'claude-sonnet-5-5', max_tokens: 4000, system: system, messages: [{ role: 'user', content: prompt }] };
  } else {
    url = 'https://generativelanguage.googleapis.com/v1beta/models/' + encodeURIComponent(c.model || 'gemini-3.8-flash') + ':generateContent';
    headers = { 'x-goog-api-key': c.key };
    payload = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }] };
    if (wantJson) payload.generationConfig = { responseMimeType: 'application/json' };
  }
  const res = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', headers: headers, payload: JSON.stringify(payload), muteHttpExceptions: true });
  const code = res.getResponseCode(), body = res.getContentText();
  if (code >= 300) {
    let msg = body;
    try { const j = JSON.parse(body); msg = (j.error && (j.error.message || j.error.type)) || body; } catch (e) {}
    throw new Error('AI request failed (' + code + '): ' + String(msg).slice(0, 300));
  }
  const j = JSON.parse(body);
  let text = c.provider === 'claude'
    ? (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('')
    : ((((j.candidates || [])[0] || {}).content || {}).parts || []).filter(p => !p.thought).map(p => p.text || '').join('');
  if (!text) throw new Error('The AI sent back an empty answer. Try again.');
  if (wantJson) return JSON.parse(text.replace(/^\s*```(?:json)?\s*|\s*```\s*$/g, ''));
  return text.trim();
}

function plain_(h) {
  return String(h || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(div|p|li)>/gi, '\n').replace(/<[^>]+>/g, ' ')
    .replace(/\[sound:[^\]]+\]/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}
function questionPrompt_(q) {
  const hasMedia = /<img|\[sound:|<video/i.test(String(q.Question) + q.Rationale);
  return 'Subject: ' + subj_(q.Subject) + (q.Topic ? ' / ' + q.Topic : '') + '\n\nQuestion:\n' + plain_(q.Question) +
    (hasMedia ? '\n(The original item includes an image or video that you cannot see.)' : '') + '\n\nChoices:\n' +
    ['A', 'B', 'C', 'D', 'E'].filter(L => String(q[L]).trim()).map(L => L + '. ' + plain_(q[L])).join('\n') +
    '\n\nAnswer key: ' + (q.Answer || 'not given') + (q.Rationale ? '\n\nRationale from the deck:\n' + plain_(q.Rationale).slice(0, 3000) : '');
}
function findQ_(qid) {
  const q = rows_('Q').find(r => String(r.ID) === String(qid));
  if (!q) throw new Error('Question ' + qid + ' was not found.');
  return q;
}

/** Explains an item; cached in the AI sheet so each item costs one request. */
function aiExplain(qid, force) {
  const sh = sheet_('A'), rows = rows_('A');
  const i = rows.findIndex(r => String(r.QuestionID) === String(qid));
  if (i >= 0 && !force && rows[i].Explanation) return { text: String(rows[i].Explanation), cached: true };
  const text = callAI_(SYS_TUTOR, questionPrompt_(findQ_(qid)) +
    '\n\nExplain this item for a PLE reviewee:\n1. Why the keyed answer is right (the mechanism or key finding).\n2. Why each other choice is wrong, one line each.\n3. One high-yield pearl or mnemonic.\nIf the answer key looks wrong, say so plainly and explain why. Keep it under 250 words.');
  if (i >= 0) sh.getRange(i + 2, 2, 1, 2).setValues([[text, new Date()]]);
  else sh.appendRow([String(qid), text, new Date()]);
  return { text: text, cached: false };
}

/** Follow-up question about an item. history: [{role:'user'|'ai', text}] */
function aiAsk(qid, message, history) {
  const ctx = qid ? questionPrompt_(findQ_(qid)) + '\n\n' : '';
  const convo = (history || []).slice(-8).map(h => (h.role === 'user' ? 'Student: ' : 'Tutor: ') + h.text).join('\n\n');
  return { text: callAI_(SYS_TUTOR, ctx + (convo ? 'Conversation so far:\n' + convo + '\n\n' : '') + 'Student: ' + message + '\n\nAnswer briefly (under 200 words).') };
}

/** Daily study plan from your own numbers; cached for the day. */
function aiCoach(force) {
  const st = getSettings_(), today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  if (!force && st.CoachDate === today && st.CoachText) return { text: st.CoachText, cached: true };
  const a = getAnalytics();
  const days = st.ExamDate ? Math.ceil((new Date(st.ExamDate + 'T00:00:00') - new Date()) / 864e5) : null;
  const subj = a.mastery.map(m => '- ' + m.subject + ': ' + (m.attempts ? m.accuracy + '% of ' + m.attempts + ' answers' : 'not started') + ', seen ' + Math.min(m.seen, m.bank) + ' of ' + m.bank + ' items').join('\n');
  const text = callAI_(SYS_TUTOR,
    'My question-bank stats for the PLE (passing needs a 75% general average and no subject below 50%):\n' +
    (days != null ? 'Days to the exam: ' + days + '\n' : '') +
    (a.ple.ga != null ? 'Projected PLE general average (last 100 answers per subject): ' + a.ple.ga + '% across ' + a.ple.tested + ' of 12 subjects; subjects under 50%: ' + a.ple.below50 + '.\n' : '') +
    'PLE subjects in exam order (recent accuracy): ' + a.ple.subjects.map(s => s.subject + ' ' + (s.recent == null ? 'untested' : s.recent + '%') + ' (' + s.bank + ' items in bank)').join('; ') + '\n' +
    'Biggest TOS gaps (exam items x miss rate): ' + a.tos.reduce((acc, s) => acc.concat(s.areas.filter(x => x.attempts >= 3).map(x => ({ t: s.subject + ' > ' + x.name, lost: x.items * (1 - x.accuracy / 100) }))), []).sort((p, q) => q.lost - p.lost).slice(0, 6).map(x => x.t + ' (~' + x.lost.toFixed(1) + ' items lost)').join('; ') + '\n' +
    'Overall: ' + a.totals.answered + ' answers, ' + a.totals.accuracy + '% accuracy, ' + a.totals.sessions + ' sessions.\n' +
    'Recent session scores: ' + (a.trend.map(t => t.score).join(', ') || 'none') + '\nBy subject:\n' + subj +
    '\n\nGive me: one or two sentences on where I stand; "### Today" with 3 bullets naming exact subjects and item counts; "### This week" with 2 bullets. Under 160 words. Base it only on these numbers.');
  setSetting_('CoachDate', today);
  setSetting_('CoachText', text);
  return { text: text, cached: false };
}

/** Writes new MCQs for review before saving. opts: {subject, topic, count, difficulty} */
function aiGenerate(opts) {
  opts = opts || {};
  const n = Math.max(1, Math.min(Number(opts.count) || 5, 10));
  const out = callAI_(SYS_TUTOR,
    'Write ' + n + ' original PLE-style single-best-answer questions.\nSubject: ' + (opts.subject || 'any') +
    (tosArea_(opts.area) ? '\nTable of Specifications area: ' + tosArea_(opts.area).name + ' (covers: ' + tosArea_(opts.area).desc + ')' : '') +
    (TOS[opts.subject] && TOS[opts.subject].bloom ? '\nMatch the PLE cognitive mix for this subject (items per 100): ' + ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map((b, i) => b + ' ' + TOS[opts.subject].bloom[i]).filter(x => !/ 0$/.test(x)).join(', ') + '.' : '') +
    (opts.topic ? '\nTopic: ' + opts.topic : '') + '\nDifficulty: ' + (opts.difficulty || 'board level') +
    '\nPrefer clinical vignettes. Each has 4 or 5 choices and one clearly best answer.\n' +
    'Return ONLY a JSON array; each item: {"question": string, "choices": [string, ...], "answer": "A".."E", "rationale": string (why right, why the others are wrong, under 120 words)}.', true);
  const arr = Array.isArray(out) ? out : (out.questions || out.items || []);
  return arr.map(x => ({
    question: String(x.question || ''), choices: (x.choices || []).slice(0, 5).map(String),
    answer: String(x.answer || '').trim().toUpperCase().slice(0, 1), rationale: String(x.rationale || ''),
  })).filter(x => x.question && x.choices.length >= 2 && /^[A-E]$/.test(x.answer));
}

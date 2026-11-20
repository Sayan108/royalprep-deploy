import type { QuestionInput } from '../src/models/question.js'

type Question = Omit<QuestionInput, 'chapter' | 'published'>
const question = (stem: string, options: string[], correct: number, explanation: string): Question =>
  ({ stem, options, correct, explanation })

const groups: { chapter: string; questions: Question[] }[] = [
  {
    chapter: 'Applied Anatomy',
    questions: [
      question('Which nerve is most commonly injured in a fracture of the surgical neck of the humerus?', ['Axillary nerve', 'Median nerve', 'Ulnar nerve', 'Musculocutaneous nerve'], 0, 'The axillary nerve winds around the surgical neck of the humerus.'),
      question('Which artery is the main blood supply to the head of the adult femur?', ['Medial circumflex femoral artery', 'Inferior gluteal artery', 'Obturator artery', 'Deep external pudendal artery'], 0, 'Retinacular branches of the medial circumflex femoral artery supply most of the adult femoral head.'),
      question('Which structure passes through the superficial inguinal ring in both sexes?', ['Ilioinguinal nerve', 'Femoral nerve', 'Obturator nerve', 'Femoral artery'], 0, 'The ilioinguinal nerve exits through the superficial inguinal ring.'),
      question('Which muscle initiates the first 15 degrees of shoulder abduction?', ['Supraspinatus', 'Subscapularis', 'Teres major', 'Latissimus dorsi'], 0, 'Supraspinatus initiates abduction, after which the deltoid is the main abductor.'),
      question('The cystic artery most commonly arises from which artery?', ['Right hepatic artery', 'Left gastric artery', 'Splenic artery', 'Superior mesenteric artery'], 0, 'The cystic artery most often originates from the right hepatic artery.'),
      question('Which nerve supplies the diaphragm with motor fibres?', ['Phrenic nerve', 'Vagus nerve', 'Sympathetic trunk', 'Recurrent laryngeal nerve'], 0, 'The phrenic nerve, principally from C3 to C5, provides motor innervation to the diaphragm.'),
      question('The portal vein is formed by the union of which two veins?', ['Superior mesenteric and splenic veins', 'Inferior vena cava and renal vein', 'Splenic and left renal veins', 'Hepatic and inferior mesenteric veins'], 0, 'The superior mesenteric and splenic veins usually unite behind the pancreas to form the portal vein.'),
      question('Which structure is found within the carotid sheath?', ['Internal jugular vein', 'Cervical sympathetic trunk', 'External jugular vein', 'Phrenic nerve'], 0, 'The carotid sheath contains the common or internal carotid artery, internal jugular vein and vagus nerve.'),
      question('Which nerve supplies sensation to the palmar surface of the little finger?', ['Ulnar nerve', 'Median nerve', 'Radial nerve', 'Axillary nerve'], 0, 'The ulnar nerve supplies sensation to the little finger and the ulnar half of the ring finger.'),
      question('The appendicular artery is usually a branch of which artery?', ['Ileocolic artery', 'Left colic artery', 'Inferior mesenteric artery', 'Gastroduodenal artery'], 0, 'The appendicular artery commonly arises from the ileocolic artery.'),
    ],
  },
  {
    chapter: 'Physiology',
    questions: [
      question('Which hormone directly increases water permeability in the collecting ducts?', ['Antidiuretic hormone', 'Insulin', 'Parathyroid hormone', 'Thyroxine'], 0, 'Antidiuretic hormone promotes aquaporin insertion in collecting duct cells.'),
      question('A rightward shift of the oxygen-haemoglobin dissociation curve is associated with which change?', ['Increased carbon dioxide', 'Decreased temperature', 'Increased pH', 'Decreased 2,3-BPG'], 0, 'Increased carbon dioxide reduces haemoglobin oxygen affinity and shifts the curve to the right.'),
      question('Which ion is chiefly responsible for the rapid upstroke of a ventricular myocyte action potential?', ['Sodium', 'Chloride', 'Potassium', 'Magnesium'], 0, 'Rapid sodium influx through voltage-gated channels causes phase 0 depolarisation.'),
      question('Where does most filtered glucose normally undergo reabsorption in the nephron?', ['Proximal convoluted tubule', 'Descending limb of Henle', 'Distal convoluted tubule', 'Collecting duct'], 0, 'Most filtered glucose is reabsorbed in the proximal tubule by sodium-glucose cotransporters.'),
      question('Which substance is primarily secreted by pancreatic beta cells?', ['Insulin', 'Glucagon', 'Somatostatin', 'Gastrin'], 0, 'Pancreatic beta cells secrete insulin; alpha cells secrete glucagon.'),
      question('Which factor directly stimulates erythropoietin production?', ['Renal tissue hypoxia', 'Increased blood oxygen content', 'High plasma calcium', 'Increased arterial pH'], 0, 'Renal oxygen-sensing cells increase erythropoietin production in response to hypoxia.'),
      question('In a healthy adult, which electrolyte is the major extracellular cation?', ['Sodium', 'Potassium', 'Magnesium', 'Phosphate'], 0, 'Sodium is the principal extracellular cation and a major determinant of extracellular osmolality.'),
      question('Which part of the cardiac conduction system normally acts as the primary pacemaker?', ['Sinoatrial node', 'Atrioventricular node', 'Bundle of His', 'Purkinje fibres'], 0, 'The sinoatrial node normally has the highest spontaneous depolarisation rate.'),
      question('Which lung volume remains after a maximal forced expiration?', ['Residual volume', 'Tidal volume', 'Inspiratory reserve volume', 'Expiratory reserve volume'], 0, 'Residual volume is the air remaining in the lungs after maximal expiration.'),
      question('Which hormone increases serum calcium by acting on bone and kidney?', ['Parathyroid hormone', 'Calcitonin', 'Aldosterone', 'Prolactin'], 0, 'Parathyroid hormone increases calcium mobilisation from bone and renal calcium reabsorption.'),
    ],
  },
  {
    chapter: 'Pathology',
    questions: [
      question('Which cell predominates in early acute bacterial inflammation?', ['Neutrophil', 'Eosinophil', 'Plasma cell', 'Fibroblast'], 0, 'Neutrophils are typically the predominant early inflammatory cells in acute bacterial infection.'),
      question('Which type of necrosis is classically seen in a myocardial infarct?', ['Coagulative necrosis', 'Liquefactive necrosis', 'Caseous necrosis', 'Fat necrosis'], 0, 'Ischaemic injury in the heart usually causes coagulative necrosis.'),
      question('Which feature is characteristic of a benign neoplasm?', ['Lack of invasion into surrounding tissue', 'Distant metastasis', 'Marked cellular pleomorphism in every case', 'Invasion through a basement membrane'], 0, 'Benign tumours do not invade surrounding tissue or metastasise.'),
      question('Which cell is primarily responsible for collagen production in wound healing?', ['Fibroblast', 'Neutrophil', 'Erythrocyte', 'Platelet'], 0, 'Fibroblasts synthesise collagen and other extracellular matrix components during repair.'),
      question('Which component is part of Virchow triad for thrombosis?', ['Endothelial injury', 'Hypoglycaemia', 'Hypercalcaemia', 'Neutropenia'], 0, 'Virchow triad comprises endothelial injury, abnormal blood flow and hypercoagulability.'),
      question('Which cell is the main effector cell in a granuloma?', ['Macrophage', 'Platelet', 'Erythrocyte', 'Basophil'], 0, 'Granulomas contain aggregates of activated macrophages, often termed epithelioid cells.'),
      question('Which finding defines carcinoma in situ?', ['Malignant epithelial cells confined above the basement membrane', 'Malignant cells in distant organs', 'Benign cells invading muscle', 'Normal epithelium surrounded by fibrosis'], 0, 'Carcinoma in situ shows malignant epithelial changes without invasion through the basement membrane.'),
      question('Which pigment accumulates in tissues in jaundice?', ['Bilirubin', 'Melanin', 'Haemosiderin', 'Lipofuscin'], 0, 'Jaundice results from bilirubin accumulation in tissues.'),
      question('Which process describes programmed cell death?', ['Apoptosis', 'Metaplasia', 'Hyperplasia', 'Hypertrophy'], 0, 'Apoptosis is a regulated form of cell death involving cell shrinkage and fragmentation.'),
      question('Which type of healing typically produces a larger scar in an open tissue defect?', ['Healing by secondary intention', 'Healing by primary intention', 'Regeneration without inflammation', 'Healing without granulation tissue'], 0, 'Secondary intention involves a larger tissue defect, granulation tissue and wound contraction.'),
    ],
  },
  {
    chapter: 'Microbiology and Immunology',
    questions: [
      question('Which organism is a Gram-positive coccus commonly found in clusters?', ['Staphylococcus aureus', 'Escherichia coli', 'Clostridium difficile', 'Neisseria meningitidis'], 0, 'Staphylococcus aureus is a Gram-positive coccus that typically forms clusters.'),
      question('Which immunoglobulin predominates in a primary antibody response?', ['IgM', 'IgE', 'IgA', 'IgD'], 0, 'IgM is generally the first antibody class produced in a primary immune response.'),
      question('Which organism is an anaerobic spore-forming Gram-positive bacillus?', ['Clostridium perfringens', 'Escherichia coli', 'Pseudomonas aeruginosa', 'Staphylococcus epidermidis'], 0, 'Clostridium perfringens is an anaerobic Gram-positive spore-forming bacillus.'),
      question('Which immune cell differentiates into an antibody-secreting plasma cell?', ['B lymphocyte', 'Neutrophil', 'Natural killer cell', 'Erythrocyte'], 0, 'Activated B lymphocytes can differentiate into plasma cells that secrete antibodies.'),
      question('Which bacterial structure is the principal component of Gram-negative endotoxin?', ['Lipopolysaccharide', 'Peptidoglycan alone', 'Flagellin', 'Capsular polysaccharide'], 0, 'Lipid A within lipopolysaccharide is responsible for endotoxin activity.'),
      question('Which organism is an acid-fast bacillus?', ['Mycobacterium tuberculosis', 'Streptococcus pyogenes', 'Escherichia coli', 'Candida albicans'], 0, 'Mycobacteria have lipid-rich cell walls that retain acid-fast stains.'),
      question('Which immunoglobulin is most abundant in normal human serum?', ['IgG', 'IgA', 'IgM', 'IgE'], 0, 'IgG is the most abundant immunoglobulin class in serum.'),
      question('Which organism is commonly associated with antibiotic-associated pseudomembranous colitis?', ['Clostridioides difficile', 'Staphylococcus aureus', 'Mycobacterium tuberculosis', 'Plasmodium falciparum'], 0, 'Toxins produced by Clostridioides difficile can cause antibiotic-associated colitis.'),
      question('Which cells present antigen to CD4-positive T cells using MHC class II?', ['Professional antigen-presenting cells', 'Mature erythrocytes', 'Platelets', 'Skeletal muscle fibres'], 0, 'Dendritic cells, macrophages and B cells are professional antigen-presenting cells that express MHC class II.'),
      question('Which antibody class is prominent in mucosal secretions?', ['IgA', 'IgD', 'IgE', 'IgM only'], 0, 'Secretory IgA is an important antibody in mucosal secretions.'),
    ],
  },
  {
    chapter: 'Perioperative Principles',
    questions: [
      question('Which blood gas pattern is consistent with respiratory acidosis?', ['Low pH and high carbon dioxide', 'High pH and low carbon dioxide', 'Low pH and low bicarbonate only', 'High pH and high bicarbonate only'], 0, 'Respiratory acidosis is characterised by reduced pH with elevated arterial carbon dioxide.'),
      question('Which blood component contains the highest concentration of clotting factors?', ['Fresh frozen plasma', 'Packed red cells', 'Albumin solution', 'Crystalloid solution'], 0, 'Fresh frozen plasma contains coagulation factors; packed red cells are used primarily to provide red cells.'),
      question('Which parameter is used as a bedside measure of urine output?', ['Volume of urine per unit time', 'Urine colour alone', 'Serum sodium alone', 'Respiratory rate alone'], 0, 'Urine output is measured as a volume over time, often adjusted for body weight.'),
      question('Which mechanism is primarily responsible for haemostasis immediately after vascular injury?', ['Platelet adhesion and aggregation', 'Collagen remodelling', 'Red cell production', 'Antibody secretion'], 0, 'Platelets adhere and aggregate at the site of injury to form the primary haemostatic plug.'),
      question('Which electrolyte abnormality can cause tall peaked T waves on an ECG?', ['Hyperkalaemia', 'Hypocalcaemia', 'Hyponatraemia', 'Hypomagnesaemia'], 0, 'Hyperkalaemia can produce tall peaked T waves and other potentially serious ECG changes.'),
      question('Which blood group is the conventional universal donor for red blood cells in an emergency?', ['O negative', 'AB positive', 'A positive', 'B negative'], 0, 'O-negative red cells lack A, B and RhD antigens, although compatibility procedures remain important.'),
      question('Which process produces the greatest heat loss from an exposed patient in a cool operating room?', ['Radiation', 'Digestion', 'Metabolism', 'Coagulation'], 0, 'Radiation is a major mechanism of heat loss from exposed skin in a cool environment.'),
      question('Which finding is included in the Glasgow Coma Scale?', ['Verbal response', 'Pupil diameter', 'Blood pressure', 'Respiratory rate'], 0, 'The Glasgow Coma Scale assesses eye opening, verbal response and motor response.'),
      question('Which type of fluid is 0.9% sodium chloride?', ['Isotonic crystalloid', 'Colloid containing albumin', 'Hypertonic protein solution', 'Packed red cell suspension'], 0, 'Normal saline is an isotonic crystalloid solution containing sodium and chloride.'),
      question('Which investigation measures haemoglobin concentration?', ['Full blood count', 'Serum amylase', 'Liver function tests', 'Urinalysis'], 0, 'A full blood count includes haemoglobin concentration and other blood cell measurements.'),
    ],
  },
]

export const seedQuestions: QuestionInput[] = groups.flatMap((group, groupIndex) =>
  group.questions.map((q, questionIndex) => {
    const offset = (groupIndex + questionIndex) % q.options.length
    return {
      ...q, chapter: group.chapter, published: true,
      options: [...q.options.slice(offset), ...q.options.slice(0, offset)],
      correct: (q.correct - offset + q.options.length) % q.options.length,
    }
  }),
)

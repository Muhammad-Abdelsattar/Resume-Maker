
import { ResumeData } from './types';

export const INITIAL_RESUME_DATA: ResumeData = {
  id: 'default',
  profileName: "Data Engineer Profile",
  fullName: "Muhammad Abd Al-sattar",
  roleTitle: "Data Engineer",
  socials: [
    { id: 's1', platform: "Phone", value: "+201005755745" },
    { id: 's2', platform: "Email", value: "muhammadabdalsattar@gmail.com", url: "mailto:muhammadabdalsattar@gmail.com" },
    { id: 's3', platform: "Location", value: "Cairo, Egypt" },
    { id: 's4', platform: "LinkedIn", value: "LinkedIn", url: "https://www.linkedin.com/in/muhammad-abd-al-sattar-611a091b2" },
    { id: 's5', platform: "GitHub", value: "GitHub", url: "https://github.com/Muhammad-Abdelsattar" }
  ],
  settings: {
    themeColor: "#3291c8",
    fontFamily: 'sans',
    fontSize: '11pt',
    documentMargin: 'standard',
    lineHeight: 'standard'
  },
  sections: [
    {
      id: 'sec_summary',
      type: 'summary',
      title: 'Professional Summary',
      content: "Motivated and detail-oriented Data Engineer with a strong foundation in data principles, automation & DataOps, software development, and Machine Learning. Experienced in <b>Python</b>, <b>SQL</b>, and core cloud services (AWS/GCP). Possesses a solid understanding of data modeling, warehousing concepts, and building end-to-end ETL and ELT pipelines."
    },
    {
      id: 'sec_edu',
      type: 'education',
      title: 'Education',
      items: [
        {
          id: 'edu1',
          title: "Bachelor of Engineering in Computers & Systems Engineering",
          subtitle: "Zagazig University",
          location: "Egypt",
          date: "09/2018 – 07/2023",
          bullets: ["Grade: <b>Very Good with honors</b>", "Graduation Project: Excellent"]
        }
      ]
    },
    {
      id: 'sec_intern',
      type: 'experience',
      title: 'Internships',
      items: [
        {
          id: 'int1',
          title: "Data Engineer",
          subtitle: "Information Technology Institute (ITI)",
          location: "Ismailya, Egypt",
          date: "03/2025 – 08/2025",
          description: "An end-to-end real-time ML based fraud detection pipeline with analytics and Data Warehousing deployed on GCP.",
          bullets: [
            "Project: <b>Real-Time Fraud Detection System</b> <a href=\"https://github.com/Muhammad-Abdelsattar\">Source Code</a>"
          ]
        }
      ]
    },
    {
      id: 'sec_skills',
      type: 'skills',
      title: 'Technical Skills',
      items: [
        { id: 'sk1', category: "Languages", items: "Python, SQL, C, Bash" },
        { id: 'sk2', category: "Data Engineering", items: "Apache Spark (PySpark), Kafka, Beam, DBT, Airflow, Hadoop" },
        { id: 'sk3', category: "Machine Learning", items: "PyTorch, Lightning, Transformers, Scikit-learn, XGBoost" },
        { id: 'sk4', category: "Cloud Computing", items: "<b>AWS</b> (EC2, S3, Glue, Redshift), <b>GCP</b> (BigQuery, Dataflow)" }
      ]
    },
    {
      id: 'sec_proj',
      type: 'projects',
      title: 'Projects',
      items: [
        {
          id: 'p1',
          title: "Real-Time Fraud Detection System",
          links: [
             { id: 'l1', label: "Source Code", url: "https://github.com/yourlink" },
             { id: 'l2', label: "Live Demo", url: "https://demo.link" }
          ],
          skills: "Streaming & Batch Processing, ELT, Data Pipelines Architecture",
          tools: "GCP, Apache Beam, Spark, Docker, Bash, Airflow",
          bullets: [
            "Engineered a <b>low-latency, event-driven streaming architecture</b> that integrates real-time machine learning inference.",
            "Designed a <b>cost-optimized data lake strategy</b> on BigQuery."
          ]
        }
      ]
    },
    {
      id: 'sec_custom',
      type: 'custom',
      title: 'Awards',
      items: [
        {
            id: 'cr1',
            hasBullet: true,
            columns: [
                { id: 'cc1', width: 20, alignment: 'left', content: "2023" },
                { id: 'cc2', width: 80, alignment: 'left', content: "<b>First Place</b> in National AI Hackathon" }
            ]
        }
      ]
    }
  ],
  additionalInfo: [
     { id: 'ad1', content: "<b>Languages:</b> Arabic (Native), English (Fluent)" },
     { id: 'ad2', content: "<b>Military Status:</b> Completed (10/2023 – 12/2024)" }
  ]
};

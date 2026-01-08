/**
 * Firebase Data Fetcher and Analyzer
 * 
 * This script connects to Firebase and fetches all course data to analyze
 * the structure and content for understanding the database schema.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');
const fs = require('fs');

// Firebase configuration (same as your app)
const firebaseConfig = {
    apiKey: "AIzaSyCLpDpzerQ_LNsRih57YRgQASoxc7hPkpQ",
    authDomain: "zor-education-app.firebaseapp.com",
    projectId: "zor-education-app",
    storageBucket: "zor-education-app.firebasestorage.app",
    messagingSenderId: "733330453592",
    appId: "1:733330453592:web:a19454b12ce03368bdc62d",
    measurementId: "G-ZL7FY4MCM5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Fetch all courses from Firebase
 */
async function fetchCourses() {
    console.log('🔍 Fetching all courses from Firebase...');
    
    try {
        const coursesCollection = collection(db, 'courses');
        const coursesSnapshot = await getDocs(coursesCollection);
        
        const courses = [];
        
        for (const courseDoc of coursesSnapshot.docs) {
            const courseData = {
                id: courseDoc.id,
                data: courseDoc.data()
            };
            
            // Fetch levels for this course
            console.log(`📚 Fetching levels for course: ${courseData.data.titles?.en || courseData.id}`);
            courseData.levels = await fetchLevelsForCourse(courseDoc.id);
            
            courses.push(courseData);
        }
        
        console.log(`✅ Fetched ${courses.length} courses`);
        return courses;
        
    } catch (error) {
        console.error('❌ Error fetching courses:', error);
        throw error;
    }
}

/**
 * Fetch all levels for a specific course
 */
async function fetchLevelsForCourse(courseId) {
    try {
        const levelsCollection = collection(db, 'courses', courseId, 'levels');
        const levelsSnapshot = await getDocs(levelsCollection);
        
        const levels = [];
        levelsSnapshot.docs.forEach(levelDoc => {
            levels.push({
                id: levelDoc.id,
                data: levelDoc.data()
            });
        });
        
        // Sort levels by level number
        levels.sort((a, b) => (a.data.level || 0) - (b.data.level || 0));
        
        console.log(`  📊 Found ${levels.length} levels for course ${courseId}`);
        return levels;
        
    } catch (error) {
        console.error(`❌ Error fetching levels for course ${courseId}:`, error);
        return [];
    }
}

/**
 * Analyze the structure of the fetched data
 */
function analyzeDataStructure(courses) {
    console.log('\n📋 Analyzing data structure...\n');
    
    const analysis = {
        summary: {
            total_courses: courses.length,
            total_levels: 0,
            total_lessons: 0,
            total_quizzes: 0
        },
        course_structure: {},
        level_structure: {},
        lesson_structure: {},
        quiz_structure: {},
        field_analysis: {
            course_fields: new Set(),
            level_fields: new Set(),
            lesson_fields: new Set(),
            quiz_fields: new Set()
        }
    };
    
    // Analyze each course
    courses.forEach((course, courseIndex) => {
        console.log(`🔍 Analyzing Course ${courseIndex + 1}: ${course.data.titles?.en || 'Untitled'}`);
        
        // Collect course fields
        Object.keys(course.data).forEach(field => {
            analysis.field_analysis.course_fields.add(field);
        });
        
        // Store first course structure as template
        if (courseIndex === 0) {
            analysis.course_structure = {
                sample_fields: Object.keys(course.data),
                sample_data: course.data
            };
        }
        
        // Analyze levels
        course.levels.forEach((level, levelIndex) => {
            analysis.summary.total_levels++;
            
            console.log(`  📊 Level ${level.data.level || levelIndex + 1}: ${level.data.titles?.en || 'Untitled'}`);
            
            // Collect level fields
            Object.keys(level.data).forEach(field => {
                analysis.field_analysis.level_fields.add(field);
            });
            
            // Store first level structure as template
            if (courseIndex === 0 && levelIndex === 0) {
                analysis.level_structure = {
                    sample_fields: Object.keys(level.data),
                    sample_data: level.data
                };
            }
            
            // Analyze lessons array
            if (level.data.lessons && Array.isArray(level.data.lessons)) {
                level.data.lessons.forEach((lesson, lessonIndex) => {
                    if (lesson.type === 'lesson') {
                        analysis.summary.total_lessons++;
                        
                        // Collect lesson fields
                        Object.keys(lesson).forEach(field => {
                            analysis.field_analysis.lesson_fields.add(field);
                        });
                        
                        // Store first lesson structure as template
                        if (courseIndex === 0 && levelIndex === 0 && !analysis.lesson_structure.sample_data) {
                            analysis.lesson_structure = {
                                sample_fields: Object.keys(lesson),
                                sample_data: lesson
                            };
                        }
                        
                    } else if (lesson.type === 'quiz') {
                        analysis.summary.total_quizzes++;
                        
                        // Collect quiz fields
                        Object.keys(lesson).forEach(field => {
                            analysis.field_analysis.quiz_fields.add(field);
                        });
                        
                        // Store first quiz structure as template
                        if (courseIndex === 0 && levelIndex === 0 && !analysis.quiz_structure.sample_data) {
                            analysis.quiz_structure = {
                                sample_fields: Object.keys(lesson),
                                sample_data: lesson
                            };
                        }
                    }
                    
                    console.log(`    📝 ${lesson.type}: ${lesson.titles?.en || lesson.titles?.ur || 'Untitled'}`);
                });
            }
        });
    });
    
    // Convert Sets to Arrays for JSON serialization
    analysis.field_analysis.course_fields = Array.from(analysis.field_analysis.course_fields);
    analysis.field_analysis.level_fields = Array.from(analysis.field_analysis.level_fields);
    analysis.field_analysis.lesson_fields = Array.from(analysis.field_analysis.lesson_fields);
    analysis.field_analysis.quiz_fields = Array.from(analysis.field_analysis.quiz_fields);
    
    return analysis;
}

/**
 * Generate a detailed report
 */
function generateReport(courses, analysis) {
    console.log('\n📊 FIREBASE DATA STRUCTURE ANALYSIS REPORT');
    console.log('==========================================\n');
    
    console.log('📈 SUMMARY STATISTICS:');
    console.log(`   Total Courses: ${analysis.summary.total_courses}`);
    console.log(`   Total Levels: ${analysis.summary.total_levels}`);
    console.log(`   Total Lessons: ${analysis.summary.total_lessons}`);
    console.log(`   Total Quizzes: ${analysis.summary.total_quizzes}`);
    console.log(`   Total Content Items: ${analysis.summary.total_lessons + analysis.summary.total_quizzes}\n`);
    
    console.log('🏗️  FIREBASE STRUCTURE:');
    console.log('   courses (collection)');
    courses.forEach(course => {
        console.log(`   ├── ${course.id} (document)`);
        console.log(`   │   ├── Course Data: ${course.data.titles?.en || 'Untitled'}`);
        console.log(`   │   └── levels (sub-collection)`);
        course.levels.forEach((level, idx) => {
            const isLast = idx === course.levels.length - 1;
            console.log(`   │       ${isLast ? '└──' : '├──'} ${level.id} (document)`);
            console.log(`   │       ${isLast ? '   ' : '│   '}├── Level Data: ${level.data.titles?.en || 'Untitled'}`);
            console.log(`   │       ${isLast ? '   ' : '│   '}└── lessons (array with ${level.data.lessons?.length || 0} items)`);
        });
    });
    
    console.log('\n📋 FIELD ANALYSIS:');
    console.log('\n   Course Fields:');
    analysis.field_analysis.course_fields.forEach(field => {
        console.log(`     • ${field}`);
    });
    
    console.log('\n   Level Fields:');
    analysis.field_analysis.level_fields.forEach(field => {
        console.log(`     • ${field}`);
    });
    
    console.log('\n   Lesson Fields:');
    analysis.field_analysis.lesson_fields.forEach(field => {
        console.log(`     • ${field}`);
    });
    
    console.log('\n   Quiz Fields:');
    analysis.field_analysis.quiz_fields.forEach(field => {
        console.log(`     • ${field}`);
    });
    
    console.log('\n🔍 DETAILED STRUCTURE EXAMPLES:');
    console.log('\nCourse Document Structure:');
    console.log(JSON.stringify(analysis.course_structure.sample_data, null, 2));
    
    console.log('\nLevel Document Structure (first level):');
    console.log(JSON.stringify(analysis.level_structure.sample_data, null, 2));
}

/**
 * Main execution function
 */
async function main() {
    console.log('🔍 ZOR Education App - Firebase Data Analyzer');
    console.log('============================================\n');
    
    try {
        // Fetch all data from Firebase
        const courses = await fetchCourses();
        
        if (courses.length === 0) {
            console.log('⚠️  No courses found in Firebase. Make sure you have uploaded some courses first.');
            return;
        }
        
        // Analyze the data structure
        const analysis = analyzeDataStructure(courses);
        
        // Generate detailed report
        generateReport(courses, analysis);
        
        // Save complete data to JSON file for detailed examination
        const outputData = {
            timestamp: new Date().toISOString(),
            analysis: analysis,
            complete_data: courses
        };
        
        const outputPath = './firebase-data-analysis.json';
        fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
        
        console.log(`\n💾 Complete data saved to: ${outputPath}`);
        console.log('📋 You can examine the full structure and all data in this file');
        
    } catch (error) {
        console.error('\n❌ Analysis failed:', error.message);
        process.exit(1);
    }
}

// Run the analyzer
main().then(() => {
    console.log('\n✅ Firebase data analysis completed successfully!');
    process.exit(0);
}).catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
});
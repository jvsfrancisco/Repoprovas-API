import { badRequestError, notFoundError } from "../utils/errorUtils.js";
import * as categoryRepository from "../repositories/categoryRepository.js";
import * as teacherRepository from "../repositories/teacherRepository.js";
import * as testRespository from "../repositories/testRepository.js";

export async function createTest(testData: testRespository.testBody) {
    const { categoryId, teacherId, disciplineId } = testData;
    await checkCategoryExistis(categoryId);
    const teacherDisciplineId = await getTeacherDisciplineId(
        teacherId,
        disciplineId
    );

    delete testData.disciplineId;
    delete testData.teacherId;

    await testRespository.createTest({ ...testData, teacherDisciplineId });
}

async function checkCategoryExistis(categoryId: number) {
    const category = await categoryRepository.getById(categoryId);

    if (!category) {
        throw notFoundError("Category not found");
    }
}

async function getTeacherDisciplineId(teacherId: number, disciplineId: number) {
    const relation = await teacherRepository.getByTeacherIdAndDiscplineId(
        teacherId,
        disciplineId
    );

    if (!relation) {
        throw badRequestError("Incorrect teacherId or disciplineId");
    }

    return relation.id;
}

export async function getTestsGroupBy(groupBy:String) {
    
    if (groupBy === "disciplines") {
        return await getTestsGroupByDiscipline();
    } else if (groupBy === "teachers") {
        return await getTestsGroupByTeacher();
    } else {
        throw badRequestError("Invalid groupBy value");
    }
    
}

export async function getTestsGroupByDiscipline(){
    const tests = await testRespository.getTestsGroupByDiscipline();

    return tests;
}

export async function getTestsGroupByTeacher(){
    const tests = await testRespository.getTestsGroupByTeacher();

    return tests;
}
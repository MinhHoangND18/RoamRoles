import { API_CONFIG } from "./config";
import { SurveySet, SurveyQuestion } from "@/types/survey_question";

// ============ SURVEY SETS ============

export async function getSurveySets(): Promise<SurveySet[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/sets`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch survey sets");
    }

    return res.json();
}

export async function getActiveSurveySets(): Promise<SurveySet[]> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/survey/sets`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to fetch active survey sets");
    }

    return res.json();
}

export async function createSurveySet(data: {
    name: string;
    description: string;
    slug: string;
    active: boolean;
}): Promise<SurveySet> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/sets`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to create survey set");
    }

    return res.json();
}

export async function updateSurveySet(
    id: number,
    data: {
        name: string;
        description: string;
        slug: string;
        active: boolean;
    }
): Promise<void> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/sets/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to update survey set");
    }
}

export async function deleteSurveySet(id: number): Promise<void> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/sets/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Failed to delete survey set");
    }
}

// ============ SURVEY QUESTIONS ============

export async function getQuestionsBySetId(setId: number): Promise<SurveyQuestion[]> {
    const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/admin/survey/sets/${setId}/questions`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch questions");
    }

    return res.json();
}

export async function getActiveQuestionsBySetId(
    setId: number
): Promise<SurveyQuestion[]> {
    const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/survey/sets/${setId}/questions`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch active questions");
    }

    return res.json();
}

export async function createQuestion(data: {
    set_id: number;
    question: string;
    active: boolean;
    options: string[];
}): Promise<SurveyQuestion> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/survey/questions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to create question");
    }

    return res.json();
}

export async function updateQuestion(
    id: number,
    data: {
        set_id: number;
        question: string;
        active: boolean;
        options: string[];
    }
): Promise<void> {
    const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/admin/survey/questions/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }
    );

    if (!res.ok) {
        throw new Error("Failed to update question");
    }
}

export async function deleteQuestion(id: number): Promise<void> {
    const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/admin/survey/questions/${id}`,
        {
            method: "DELETE",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to delete question");
    }
}

export async function submitSurveyResponse(data: {
    set_id: number;
    session_id: string;
    answers: { [key: string]: string };
}): Promise<void> {
    const res = await fetch(`${API_CONFIG.BASE_URL}/api/survey/responses`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("Failed to submit survey response");
    }
}


export async function getSurveyStatistics(setId: number): Promise<any> {
    const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/admin/survey/sets/${setId}/statistics`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch survey statistics");
    }

    return res.json();
}
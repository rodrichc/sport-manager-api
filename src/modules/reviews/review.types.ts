export interface CreateReviewDTO {
    rating: number;
    comment?: string;
}

export interface UpdateReviewDTO {
    rating?: number;
    comment?: string;
}

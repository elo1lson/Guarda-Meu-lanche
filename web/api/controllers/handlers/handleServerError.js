import { StatusCodes } from "http-status-codes";
export const handleError = ({ r, e }) => {
    console.log(e);

    if (e.status) return r.status(e.status).json(e);

    return r.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: e.status || StatusCodes.INTERNAL_SERVER_ERROR,
        error:
            e.message ||
            "erro interno do servidor, por favor tente novamente mais tarde.",
    });
};

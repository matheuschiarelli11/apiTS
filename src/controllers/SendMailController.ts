import { Request, Response } from 'express';
import { getCustomRepository } from 'typeorm';
import { SurveysRepository } from '../repositories/SurveysRepository';
import { SurveysUsersRepository } from '../repositories/SurveysUsersRepository';
import { UsersRepository } from '../repositories/UsersRepository';
import SendMailService from '../services/SendMailService';
import { resolve } from 'path';

class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const userRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const userAlreadyExists = await userRepository.findOne({
            email
        });

        if(!userAlreadyExists) {
            return response.status(400).json({ error: "User does not exist", });
        }

        const survey = await surveysRepository.findOne({
            id: survey_id
        });

        if(!survey) {
            return response.status(400).json({ error: "Survey does not exist", }); 
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs")

        const surveyUserExist = await surveysUsersRepository.findOne({
            where: {user_id: userAlreadyExists.id, value : null},
        });

        const variables = {
            name: userAlreadyExists.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL,
        }

        if (surveyUserExist){
            variables.id = surveyUserExist.id;
            await SendMailService.execute(email, survey.title, variables, npsPath)
            return response.json(surveyUserExist);
        }

        const surveyUser = surveysUsersRepository.create({
            user_id: userAlreadyExists.id,
            survey_id
        })
        
        await surveysUsersRepository.save(surveyUser)
        //Enviar email para usuário

        variables.id = surveyUser.id;
        await SendMailService.execute(email, survey.title, variables, npsPath);

        return response.json(surveyUser);
    }
}

export { SendMailController };
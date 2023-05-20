import axios from "axios";

describe('Test authenticated', () => {
    it ('Should redirect if not authenticated', async () => {
        try {
            const response = await axios.get('http://localhost:8080/v1/authenticate', {
            maxRedirects: 20,
            beforeRedirect: (redirect) => {
                console.log(redirect.pathname)
                expect(redirect.pathname).toBe('/login')
            },
        })

        expect(response.status).toBe(302)
        } catch (error) {
            expect(error).toBe(undefined)
        }
        
    })
});
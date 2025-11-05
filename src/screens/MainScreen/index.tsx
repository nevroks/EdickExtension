import { Button, TextInput } from "@/ui";
import { useState } from "react";

const MainScreen = () => {

    const [id, setId] = useState('')


    return (
        <div>
            <h1>Main</h1>
            <div>
                <TextInput onChange={(e) => setId(e.target.value)} value={id} placeholder="Введите свой t-id" />
                <Button>
                    <Button.Text text="Войти" />
                </Button>
            </div>

        </div>
    );
}

export default MainScreen;

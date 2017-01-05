<?php

namespace App\Model;

class Reportes extends Model
{
    /**
     * Get all books.
     *
     * @return object
     */
    public function fetchAll($data)
    {
        $dataQuery = "SELECT * FROM reportes where status = 1 ";
        $countQuery = "SELECT COUNT(1) AS COUNTER FROM reportes WHERE 1 ";


        $stmt = $this->pdo->prepare("s");
        $stmt->execute();

       return $stmt->fetchAll(\PDO::FETCH_OBJ);
    }

    /**
     * Get book specified by id.
     *
     * @return object
     */
    public function fetchById($id)
    {
        $stmt = $this->pdo->prepare("SELECT * FROM books WHERE id = ? LIMIT 1");
        $stmt->execute(array( $id ));

        return $stmt->fetch(\PDO::FETCH_OBJ);
    }
}
